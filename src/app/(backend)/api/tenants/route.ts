import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createSessionToken, verifySessionToken } from '@/lib/session';
import cloudinary from '@/lib/cloudinary';

/**
 * @swagger
 * /api/tenants:
 *   get:
 *     summary: Mengambil semua daftar tenant
 *     tags: [Tenants]
 *     description: |
 *       Mengembalikan seluruh data merchant / tenant (Toko Baju, Servis AC, dll) yang terdaftar di aplikasi.
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Mengambil semua isi dari tabel `tenants`, diurutkan berdasarkan namanya.
 *       2. Menampilkan hasilnya.
 *     responses:
 *       200:
 *         description: Berhasil mengambil data
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Profil belum lengkap
 *   post:
 *     summary: Membuat tenant baru
 *     tags: [Tenants]
 *     description: |
 *       Mendaftarkan toko/tenant baru dari User biasa yang ingin berjualan / menjadi penyedia jasa.
 *       Slug dan Kode Tenant akan di-generate otomatis oleh sistem.
 *       Mendukung upload file (multipart/form-data) atau Base64 (application/json).
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Verifikasi pengguna (harus login).
 *       2. Memastikan pengakses memiliki Role "user biasa". Jika sudah jadi tenant, pendaftaran ditolak.
 *       3. Mengecek kelengkapan biodata di profil (Nama, Nomor HP). Jika belum, wajib melengkapi dulu.
 *       4. Menerima request input detail toko beserta gambar banner (diunggah ke Cloudinary).
 *       5. **Auto-Generate**: Sistem akan membuat Slug unik, dan membuat `kode_tenant` berisi 4 huruf acak (misal X9Q1) sebagai kode registrasi staf.
 *       6. Menyimpan data toko tersebut ke tabel `tenants`.
 *       7. **Otomatisasi Role**: Role user tersebut otomatis di-*upgrade* (dari user biasa menjadi **Owner Tunggal**).
 *       8. Memperbarui Token JWT dengan Role baru, lalu mengatur ulang HttpOnly Cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, description: "Nama Bisnis/Tenant" }
 *               address: { type: string }
 *               phone: { type: string }
 *               image_url: { type: string, description: "URL Gambar atau Base64" }
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               address: { type: string }
 *               phone: { type: string }
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Gambar tenant (Cloudinary)
 *     responses:
 *       201:
 *         description: Tenant berhasil dibuat
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Profil belum lengkap
 */

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .order('name');

    if (error) throw error;
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Terjadi kesalahan saat mengambil daftar tenant.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verifikasi Identitas dari HttpOnly Cookie
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifySessionToken(token) : null;
    
    if (!token || !session) {
      return NextResponse.json({ error: 'Sesi tidak valid atau Anda belum login. Silakan login kembali.' }, { status: 401 });
    }

    const userId = (session as any).userId;
    const userRole = (session as any).role;

    // 2. Batasi akses: Hanya 'user biasa' yang boleh mendaftar tenant
    if (userRole !== 'user biasa') {
      return NextResponse.json({ 
        error: 'Hanya pengguna dengan role "user biasa" yang dapat mendaftar sebagai tenant.' 
      }, { status: 403 });
    }

    // 3. Cek apakah user sudah memiliki tenant sebelumnya
    const { data: currentProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('kode_tenant, full_name, phone')
      .eq('user_id', userId)
      .single();

    if (currentProfile?.kode_tenant) {
      return NextResponse.json({ 
        error: 'Anda sudah terdaftar sebagai pemilik tenant. Satu akun hanya dapat memiliki satu tenant.' 
      }, { status: 403 });
    }

    // 4. Cek kelengkapan profile
    const isProfileComplete = 
      currentProfile?.full_name && currentProfile.full_name.trim() !== "" &&
      currentProfile?.phone && currentProfile.phone.trim() !== "";

    if (!isProfileComplete) {
      return NextResponse.json({ 
        error: 'Profil belum lengkap. Silakan lengkapi Nama Lengkap dan Nomor Telepon di profil Anda terlebih dahulu.',
        code: 'INCOMPLETE_PROFILE'
      }, { status: 403 });
    }

    const contentType = request.headers.get('content-type') || '';
    let name: string | undefined, address: string | undefined, phone: string | undefined, image_url: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      name = formData.get('name') as string;
      address = formData.get('address') as string;
      phone = formData.get('phone') as string;

      // Handle File Upload to Cloudinary
      const file = formData.get('file') as File;
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { 
              folder: 'sf-service/tenants', 
              format: 'webp',
              use_filename: true,
              unique_filename: true
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        });
        image_url = (uploadResult as any).secure_url;
      }
    } else {
      const body = await request.json();
      name = body.name;
      address = body.address;
      phone = body.phone;
      image_url = body.image_url;

      // Detect Base64 and upload to Cloudinary
      if (image_url && image_url.startsWith('data:image')) {
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(
            image_url as string,
            { 
              folder: 'sf-service/tenants', 
              format: 'webp' 
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
        });
        image_url = (uploadResult as any).secure_url;
      }
    }

    if (!name) {
      return NextResponse.json({ error: 'Nama Tenant wajib diisi' }, { status: 400 });
    }

    // 5. Otomasi Slug dan Kode Tenant
    const slug = (name as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const generatedKode = Math.random().toString(36).substring(2, 6).toUpperCase();

    // 6. Masukkan data tenant baru
    const { data: newTenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .insert([{ 
        name, 
        slug, 
        kode_tenant: generatedKode, 
        address, 
        phone, 
        image_url 
      }])
      .select()
      .single();

    if (tenantError) {
      if (tenantError.code === '23505') {
        return NextResponse.json({ error: 'Nama Tenant (Slug) atau Kode Tenant sudah digunakan. Silakan coba nama lain.' }, { status: 400 });
      }
      throw tenantError;
    }

    // 7. Update Profile User: Set kode_tenant dan ubah role menjadi 'owner tunggal'
    const { data: ownerRole, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', 'owner tunggal')
      .single();

    if (roleError || !ownerRole) {
      console.error('Gagal menemukan role owner:', roleError?.message);
    } else {
      await supabaseAdmin
        .from('profiles')
        .update({ 
          kode_tenant: generatedKode,
          role_id: ownerRole.id 
        })
        .eq('user_id', userId);
    }

    // 8. Refresh Token Sesi agar Role user langsung terupdate (dari 'user biasa' -> 'owner tunggal')
    const newPayload = { 
      userId: userId, 
      role: 'owner tunggal', 
      email: (session as any).email 
    };
    const newToken = await createSessionToken(newPayload);

    const response = NextResponse.json({ 
      data: newTenant, 
      message: `Selamat! Tenant berhasil dibuat dengan Kode: ${generatedKode}. Akun Anda kini telah menjadi Owner.` 
    }, { status: 201 });

    // Set cookie baru ke response
    response.cookies.set('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 jam
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Tenant Creation Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal saat mendaftarkan tenant baru.' }, { status: 500 });
  }
}
