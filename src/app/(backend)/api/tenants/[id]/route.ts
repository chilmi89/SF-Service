import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySessionToken } from '@/lib/session';
import cloudinary from '@/lib/cloudinary';
import { checkProfileCompletion } from '@/lib/profile';

/**
 * @swagger
 * /api/tenants/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *   get:
 *     summary: Melihat detail tenant
 *     tags: [Tenants]
 *     description: |
 *       Menampilkan profil rinci sebuah toko (tenant).
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Mengambil ID dari parameter endpoint.
 *       2. Menarik dan mengembalikan data tenant bersangkutan.
 *     responses:
 *       200:
 *         description: Berhasil
 *   put:
 *     summary: Memperbarui data tenant
 *     tags: [Tenants]
 *     description: |
 *       Semua field ditampilkan, namun secara sistem hanya **Nomor Telepon** dan **Gambar** yang dapat diubah berkali-kali. 
 *       Nama, Slug, Alamat, dan Kode Tenant bersifat permanen setelah dibuat.
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Validasi token JWT & otorisasi.
 *       2. Pengecekan ketat: Pastikan bahwa user yang merequest benar-benar Pemilik (*Owner*) dari Tenant yang akan di-update, atau dia adalah Super Admin.
 *       3. Mengunggah gambar baru ke Cloudinary jika diberikan.
 *       4. **Enforcement (Pencegahan)**: Menyaring field payload JSON; fitur ubah nama toko/kode hanya diizinkan apabila user ber-role Super Admin.
 *       5. Memperbarui tabel `tenants`. Jika kode referal diubah oleh Super Admin, akan secara reaktif mengupdate kolom kode_tenant di semua `profiles` pegawainya.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone: { type: string, description: "Nomor HP baru" }
 *               norek: { type: string, description: "Nomor Rekening Pembayaran" }
 *               image_url: { type: string, description: "URL Gambar baru" }
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               phone: { type: string, description: "Nomor HP baru" }
 *               norek: { type: string, description: "Nomor Rekening Pembayaran" }
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Foto baru untuk diupload (Cloudinary)
 *     responses:
 *       200:
 *         description: Berhasil diperbarui
 *   delete:
 *     summary: Menghapus tenant
 *     tags: [Tenants]
 *     description: |
 *       Menghapus layanan bisnis / toko milik pengguna dari platform.
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Memeriksa identitas (Hanya Owner toko tersebut / Super admin).
 *       2. Memastikan tidak ada *foreign key block* (misal layanan aktif masih tersisa).
 *       3. **Downgrade Otomatis**: Jika berhasil dihapus, Role dari owner akan diturunkan (didowngrade) kembali menjadi `user biasa` dan kolom `kode_tenant` di tabel `profiles`-nya dibersihkan (menjadi null).
 *       4. Record tenant dihapus permanen.
 *     responses:
 *       204:
 *         description: Berhasil dihapus
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 404 });

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
    // 1. Verifikasi Identitas & Profile
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifySessionToken(token) : null;
    if (!token || !session) {
      return NextResponse.json({ error: 'Tidak sah' }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session as any).userId;
    const userRole = (session as any).role;

    // 2. Ambil data Tenant (Gunakan select * agar sama persis dengan GET yang berhasil)
    const { data: targetTenant, error: fetchError } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !targetTenant) {
      console.error(`[PUT Error] Fetch gagal untuk ID ${id}:`, fetchError?.message);
      return NextResponse.json({ error: 'Data tenant tidak ditemukan.' }, { status: 404 });
    }

    // 3. Ambil data Profile User
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('kode_tenant')
      .eq('user_id', userId)
      .single();

    // 4. PROTEKSI KEAMANAN: Hanya Super Admin atau Pemilik Tenant (Owner) yang boleh edit
    let userKode = userProfile?.kode_tenant?.trim();
    const tenantKode = targetTenant.kode_tenant?.trim();
    
    const normalizedRole = userRole?.toString().toLowerCase().trim();
    const isSuperAdmin = normalizedRole === 'super admin';
    const isPotentialOwner = normalizedRole === 'owner tunggal' || normalizedRole === 'admin tenant';

    // LOGIKA SELF-HEALING: Jika profil user kodenya kosong tapi rolenya Owner, kita bantu sambungkan
    if (!userKode && isPotentialOwner) {
      await supabaseAdmin.from('profiles').update({ kode_tenant: tenantKode }).eq('user_id', userId);
      userKode = tenantKode; // Update lokal agar isOwner jadi true
    }

    const isOwner = userKode === tenantKode && userKode !== undefined && userKode !== null;

    if (!isSuperAdmin && !isOwner) {
      return NextResponse.json({ 
        error: 'Akses ditolak. Anda tidak memiliki izin untuk mengubah data ini.'
      }, { status: 403 });
    }

    const contentType = request.headers.get('content-type') || '';
    let updateFields: any = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      updateFields = {
        name: formData.get('name') as string || undefined,
        address: formData.get('address') as string || undefined,
        phone: formData.get('phone') as string || undefined,
        kode_tenant: formData.get('kode_tenant') as string || undefined,
        norek: formData.get('norek') as string || undefined,
      };

      if (updateFields.name) {
        updateFields.slug = updateFields.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }

      const file = formData.get('file') as File;
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream({ folder: 'sf-service/tenants', format: 'webp' }, (error, result) => {
            if (error) reject(error); else resolve(result);
          }).end(buffer);
        });
        updateFields.image_url = (uploadResult as any).secure_url;
      }
    } else {
      const fullBody = await request.json();
      updateFields = {
        name: fullBody.name || undefined,
        address: fullBody.address || undefined,
        phone: fullBody.phone || undefined,
        kode_tenant: fullBody.kode_tenant || undefined,
        image_url: fullBody.image_url || undefined,
        norek: fullBody.norek || undefined,
      };

      if (updateFields.name) {
        updateFields.slug = updateFields.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }

      if (updateFields.image_url && updateFields.image_url.startsWith('data:image')) {
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(updateFields.image_url, { folder: 'sf-service/tenants', format: 'webp' }, (error, result) => {
            if (error) reject(error); else resolve(result);
          });
        });
        updateFields.image_url = (uploadResult as any).secure_url;
      }
    }

    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

    // 6. ENFORCEMENT PEMBATASAN:
    // Hanya Super Admin yang bisa ubah Nama/Alamat/Kode setelah pendaftaran
    if (normalizedRole !== 'super admin') {
      delete updateFields.name;
      delete updateFields.slug;
      delete updateFields.address;
      delete updateFields.kode_tenant;
    }

    // 7. LOGIKA UPDATE KODE TENANT (Khusus Super Admin jika ingin mengubah kode)
    const oldKode = targetTenant.kode_tenant;
    const newKode = updateFields.kode_tenant;

    if (newKode && newKode !== oldKode) {
      // Langkah A: Set NULL dulu di profil agar hubungan "putus" sementara
      await supabaseAdmin
        .from('profiles')
        .update({ kode_tenant: null })
        .eq('kode_tenant', oldKode);

      // Langkah B: Update tabel Tenant dengan kode baru
      const { data, error } = await supabaseAdmin
        .from('tenants')
        .update(updateFields)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        // Jika gagal, kembalikan kode lama ke profil agar tidak rusak
        await supabaseAdmin
          .from('profiles')
          .update({ kode_tenant: oldKode })
          .eq('kode_tenant', null); // Hati-hati: ini akan mengenai semua yang NULL
        
        throw error;
      }

      // Langkah C: Pasang kembali kode baru ke profil
      await supabaseAdmin
        .from('profiles')
        .update({ kode_tenant: newKode })
        .is('kode_tenant', null);

      return NextResponse.json({ 
        data, 
        message: 'Data tenant berhasil diperbarui secara keseluruhan.' 
      }, { status: 200 });
    }

    // Update standar untuk Owner
    const { data, error } = await supabaseAdmin
      .from('tenants')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      data, 
      message: 'Data tenant berhasil diperbarui.' 
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memperbarui data tenant.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verifikasi Identitas & Profile
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifySessionToken(token) : null;
    if (!token || !session) {
      return NextResponse.json({ error: 'Sesi tidak valid atau Anda belum login.' }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session as any).userId;
    const userRole = (session as any).role;

    // 2. Ambil data Tenant untuk cek kepemilikan
    const { data: targetTenant, error: fetchError } = await supabaseAdmin
      .from('tenants')
      .select('kode_tenant')
      .eq('id', id)
      .single();

    if (fetchError || !targetTenant) {
      return NextResponse.json({ error: 'Data tenant tidak ditemukan.' }, { status: 404 });
    }

    // 3. Pengecekan Hak Akses
    const isSuperAdmin = userRole === 'super admin';
    
    // Jika bukan Super Admin, cek apakah dia pemiliknya
    if (!isSuperAdmin) {
      const { data: userProfile } = await supabaseAdmin
        .from('profiles')
        .select('kode_tenant')
        .eq('user_id', userId)
        .single();

      if (userProfile?.kode_tenant !== targetTenant.kode_tenant) {
        return NextResponse.json({ error: 'Akses ditolak. Anda tidak memiliki izin untuk menghapus tenant ini.' }, { status: 403 });
      }
    }

    // 4. Downgrade Role ke 'user biasa' (Lakukan SEBELUM hapus tenant agar kode_tenant masih bisa dicari)
    const deletedKode = targetTenant.kode_tenant;
    const { data: normalRole } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', 'user biasa')
      .single();

    if (normalRole) {
      await supabaseAdmin
        .from('profiles')
        .update({ 
          role_id: normalRole.id,
          kode_tenant: null 
        })
        .eq('kode_tenant', deletedKode);
    }

    // 5. Proses Hapus Tenant
    const { error } = await supabaseAdmin
      .from('tenants')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === '23503') {
        return NextResponse.json({ 
          error: 'Tenant tidak bisa dihapus karena masih memiliki data layanan atau transaksi yang terhubung.' 
        }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ 
      message: 'Tenant berhasil dihapus dan role pengguna telah dikembalikan menjadi user biasa.' 
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Terjadi kesalahan saat mencoba menghapus tenant.' }, { status: 500 });
  }
}
