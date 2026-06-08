import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySessionToken } from '@/lib/session';

/**
 * @swagger
 * /api/orders/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *   get:
 *     summary: Melihat detail pesanan
 *     tags: [Orders]
 *     description: |
 *       Menampilkan informasi lengkap sebuah pesanan berserta layanan dan transaksinya.
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Verifikasi Session.
 *       2. Mengambil data order secara detail dari database beserta data join (layanan dan transaksi).
 *       3. Memeriksa Otorisasi: Customer hanya diizinkan melihat miliknya sendiri. Owner/Admin hanya diizinkan melihat pesanan yang masuk ke tenant miliknya.
 *     responses:
 *       200:
 *         description: Berhasil
 *   put:
 *     summary: Mengubah status pesanan atau mengunggah bukti pembayaran
 *     tags: [Orders]
 *     description: |
 *       Memperbarui status pesanan (oleh Owner) ATAU mengunggah bukti pembayaran (oleh Customer) ketika pesanan berada pada status Menunggu Pembayaran (ID: 7).
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Verifikasi hak akses (Owner bisa ubah status, Customer hanya bisa unggah bukti pembayaran).
 *       2. Jika ada file/gambar `bukti_pembayaran` dan status pesanan adalah 7, sistem akan mengunggah gambar ke Cloudinary dan meng-update tabel `transactions`.
 *       3. Mengubah nilai kolom `status` di tabel `orders` (Khusus Owner/Admin).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: integer, description: "ID Status pesanan (contoh: 2 = proses, 4 = selesai). Khusus Owner." }
 *               bukti_pembayaran: { type: string, description: "Base64 gambar bukti pembayaran (saat status=7). Bisa diakses Customer." }
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: integer, description: "ID Status pesanan. Khusus Owner." }
 *               bukti_pembayaran: 
 *                 type: string
 *                 format: binary
 *                 description: File gambar bukti pembayaran untuk diupload (Cloudinary)
 *     responses:
 *       200:
 *         description: Berhasil diperbarui
 */

import cloudinary from '@/lib/cloudinary';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: 'Tidak sah' }, { status: 401 });
    }

    const userId = (session as any).userId;
    const role = (session as any).role?.toLowerCase();

    const { id } = await params;
    
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, kode_tenant')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        layanan (nama_layanan, harga_dasar, tenant_id, tenants(norek)),
        transactions (invoice_number, total_bayar, status_pembayaran)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });

    if (['owner', 'owner tunggal', 'owner_tunggal', 'admin tenant'].includes(role)) {
      const { data: targetTenant } = await supabaseAdmin.from('tenants').select('id').eq('kode_tenant', profile.kode_tenant).single();
      if (!targetTenant || data.layanan?.tenant_id !== targetTenant.id) {
        return NextResponse.json({ error: 'Akses ditolak: Pesanan bukan milik tenant Anda' }, { status: 403 });
      }
    } else {
      if (data.id_customer !== profile.id) {
        return NextResponse.json({ error: 'Akses ditolak: Anda tidak memiliki akses ke pesanan ini' }, { status: 403 });
      }
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifySessionToken(token) : null;
    
    if (!session) {
      return NextResponse.json({ error: 'Tidak sah' }, { status: 401 });
    }

    const role = (session as any).role?.toLowerCase();
    const isOwner = ['owner', 'owner tunggal', 'owner_tunggal', 'admin tenant'].includes(role);
    
    const { id } = await params;
    const contentType = request.headers.get('content-type') || '';
    
    let statusUpdate: number | undefined;
    let uploadedUrl: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      statusUpdate = formData.get('status') ? parseInt(formData.get('status') as string, 10) : undefined;
      
      const file = formData.get('bukti_pembayaran') as File;
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream({ folder: 'sf-service/bukti_pembayaran', format: 'webp' }, (error, result) => {
            if (error) reject(error); else resolve(result);
          }).end(buffer);
        });
        uploadedUrl = (uploadResult as any).secure_url;
      }
    } else {
      const body = await request.json();
      statusUpdate = body.status;
      
      const base64Image = body.bukti_pembayaran;
      if (base64Image && base64Image.startsWith('data:image')) {
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(base64Image, { folder: 'sf-service/bukti_pembayaran', format: 'webp' }, (error, result) => {
            if (error) reject(error); else resolve(result);
          });
        });
        uploadedUrl = (uploadResult as any).secure_url;
      }
    }

    // Hanya owner yang boleh ubah status
    if (statusUpdate !== undefined && !isOwner) {
      return NextResponse.json({ error: 'Hanya Owner/Admin yang dapat merubah status pesanan' }, { status: 403 });
    }

    // Dapatkan detail pesanan saat ini untuk verifikasi
    const { data: currentOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('status, id_customer')
      .eq('id', id)
      .single();

    if (orderError || !currentOrder) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    // Jika ingin update status
    let updateResult: any = null;
    if (statusUpdate !== undefined && isOwner) {
      const { data: updatedOrder, error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ status: statusUpdate })
        .eq('id', id)
        .select()
        .single();
        
      if (updateError) throw updateError;
      updateResult = updatedOrder;
    }

    // Jika mengunggah bukti pembayaran
    if (uploadedUrl) {
      // Pastikan pesanan sedang dalam status 7 (Menunggu Pembayaran)
      // Jika statusnya baru saja diupdate ke 7 pada request yang sama, boleh.
      const isStatus7 = (statusUpdate === 7) || (currentOrder.status === 7);
      
      if (!isStatus7) {
        return NextResponse.json({ error: 'Bukti pembayaran hanya dapat diunggah saat status pesanan adalah Menunggu Pembayaran (ID: 7)' }, { status: 400 });
      }

      // Update tabel transactions
      const { error: txError } = await supabaseAdmin
        .from('transactions')
        .update({ 'bukti pembayaran': uploadedUrl })
        .eq('id_order', id);

      if (txError) {
        console.error("Gagal menyimpan bukti pembayaran:", txError);
        return NextResponse.json({ error: 'Gagal menyimpan bukti pembayaran ke database transaksi' }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      data: updateResult || currentOrder, 
      message: uploadedUrl ? 'Bukti pembayaran berhasil diunggah' : 'Status pesanan berhasil diperbarui' 
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
