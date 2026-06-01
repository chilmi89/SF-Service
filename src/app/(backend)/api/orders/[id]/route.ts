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
 *     summary: Mengubah status pesanan (Untuk Owner)
 *     tags: [Orders]
 *     description: |
 *       Memperbarui tahapan/status suatu pesanan.
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Verifikasi hak akses (Hanya Role Owner/Admin).
 *       2. Mengubah nilai kolom `status` di tabel `orders` berdasarkan input body (contoh: 2=proses, 4=selesai).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: integer, description: "ID Status pesanan (contoh: 2 = proses, 4 = selesai, 5 = disetujui)" }
 *     responses:
 *       200:
 *         description: Berhasil diperbarui
 */

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
    
    // Dapatkan data profil user yang login
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, kode_tenant')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 });
    }
    
    // Join dengan transactions dan layanan
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        layanan (nama_layanan, harga_dasar, tenant_id),
        transactions (invoice_number, total_bayar, status_pembayaran)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });

    // Pengecekan Hak Akses (Otorisasi)
    if (['owner', 'owner tunggal', 'owner_tunggal', 'admin tenant'].includes(role)) {
      // Pastikan pesanan ini ditujukan untuk tenant milik Owner/Admin
      const { data: targetTenant } = await supabaseAdmin.from('tenants').select('id').eq('kode_tenant', profile.kode_tenant).single();
      
      // Jika tenant target tidak sesuai dengan tenant dari layanan di pesanan tersebut, tolak akses
      if (!targetTenant || data.layanan?.tenant_id !== targetTenant.id) {
        return NextResponse.json({ error: 'Akses ditolak: Pesanan bukan milik tenant Anda' }, { status: 403 });
      }
    } else {
      // Jika Customer Biasa, pastikan ID customer di pesanan sama dengan ID profilnya
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
    
    // Hanya owner/admin tenant yang boleh ubah status
    if (!['owner', 'owner tunggal', 'owner_tunggal', 'admin tenant'].includes(role)) {
      return NextResponse.json({ error: 'Hanya Owner atau Admin yang dapat merubah status pesanan' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status: body.status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data, message: 'Status pesanan berhasil diperbarui' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
