import { NextResponse, NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySessionToken } from '@/lib/session';
import cloudinary from '@/lib/cloudinary';
import { checkRateLimit } from '@/lib/rateLimit';

/**
 * @swagger
 * /api/profiles/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *   get:
 *     summary: Mendapatkan detail profil berdasarkan ID
 *     tags: [Profiles]
 *     description: |
 *       Mengambil profil lengkap satu pengguna beserta relasi email dan nama tenant.
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Menerima parameter `id` profil.
 *       2. Menggabungkan data dari tabel `profiles`, `auth_users` (email), dan `tenants` (nama bisnis).
 *     responses:
 *       200:
 *         description: Berhasil
 *   put:
 *     summary: Memperbarui data profil (Mendukung upload file avatar)
 *     tags: [Profiles]
 *     description: |
 *       Fungsi untuk user mengedit pengaturan akun dan profilnya sendiri, termasuk ganti foto.
 *       **Batasan (Rate Limit): Edit profil hanya dapat dilakukan 1 kali dalam seminggu.** (Kecuali bagi user baru yang pertama kali melengkapi profilnya).
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Pengecekan sesi & validasi token login.
 *       2. Memastikan user hanya mengedit ID profil miliknya (kecuali Super Admin).
 *       3. **Rate Limiting**: Mengecek apakah ini adalah "Edit Profil" (profil sebelumnya sudah lengkap). Jika ya, batasi 1x seminggu.
 *       4. Mendeteksi apakah input berisi `multipart/form-data` (foto) atau Base64.
 *       5. Melakukan kompresi dan upload otomatis ke **Cloudinary**.
 *       6. Menyimpan pembaruan URL foto dan biodata ke tabel `profiles`.
 *       7. *Otomatis update credentials*: Jika JSON memuat `email` atau `password` baru, otomatis bcrypt-hash ulang lalu update ke tabel `auth_users`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name: { type: string }
 *               phone: { type: string }
 *               address: { type: string }
 *               avatar_url: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               full_name: { type: string }
 *               phone: { type: string }
 *               address: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Foto profil baru (akan otomatis diupload ke Cloudinary)
 *     responses:
 *       200:
 *         description: Berhasil diperbarui
 *       429:
 *         description: Batas edit profil tercapai
 *   delete:
 *     summary: Menghapus profil
 *     tags: [Profiles]
 *     description: |
 *       Menghapus sebuah profil pengguna (hapus akun).
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Verifikasi otorisasi pengguna.
 *       2. Menghapus data akun secara spesifik.
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
    
    // Join dengan auth_users dan tenants untuk mengambil data tambahan
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*, auth_users(email), tenants(name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 });

    // Merapikan respon sesuai permintaan user
    const profileResponse = {
      ...data,
      email: (data.auth_users as any)?.email || null,
      password: "",
      tenant_name: (data.tenants as any)?.name || null // Opsional: Beri nama tenant
    };

    // Hapus properti internal dan join mentah
    delete profileResponse.auth_users;
    delete profileResponse.tenants;
    delete profileResponse.user_id;
    delete profileResponse.role_id;

    return NextResponse.json({ data: profileResponse }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verifikasi Identitas dari HttpOnly Cookie
    const token = request.cookies.get('token')?.value;
    
    const decoded = token ? await verifySessionToken(token) : null;
    if (!token || !decoded) {
      return NextResponse.json({ error: 'Sesi habis atau tidak sah. Silakan login kembali.' }, { status: 401 });
    }

    const { id } = await params;
    
    // 2. Ambil data profil lama untuk pengecekan kepemilikan
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, full_name, phone')
      .eq('id', id)
      .single();

    if (fetchError || !existingProfile) {
      return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 });
    }

    // 3. Keamanan: User hanya boleh mengedit profilnya sendiri (kecuali admin jika nanti ada logicnya)
    if (existingProfile.user_id !== (decoded as any).userId) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses untuk mengedit profil ini.' }, { status: 403 });
    }

    // 3.5 Pengecekan Limitasi Edit Profil (1 minggu sekali)
    // Jika profil sudah ada datanya (full_name dan phone tidak kosong), maka dihitung sebagai "Edit"
    const isEditing = existingProfile.full_name && existingProfile.full_name.trim() !== "" && 
                      existingProfile.phone && existingProfile.phone.trim() !== "";
                      
    if (isEditing) {
      const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
      const rateLimit = await checkRateLimit('edit_profile', id.toString(), 1, ONE_WEEK_MS);
      
      if (!rateLimit.allowed) {
        const daysLeft = Math.ceil(rateLimit.remainingMs / (24 * 60 * 60 * 1000));
        return NextResponse.json({ 
          error: `Anda hanya diizinkan mengedit profil 1 kali dalam seminggu. Silakan tunggu ${daysLeft} hari lagi.` 
        }, { status: 429 });
      }
    }

    const contentType = request.headers.get('content-type') || '';
    let updateFields: any = {};
    let email, password;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      updateFields = {
        full_name: formData.get('full_name') as string || undefined,
        phone: formData.get('phone') as string || undefined,
        address: formData.get('address') as string || undefined,
      };
      email = formData.get('email') as string;
      password = formData.get('password') as string;

      // Handle File Upload to Cloudinary
      const file = formData.get('file') as File;
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { 
              folder: 'sf-service/profiles', 
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
        updateFields.avatar_url = (uploadResult as any).secure_url;
      }
    } else {
      const body = await request.json();
      updateFields = {
        full_name: body.full_name,
        phone: body.phone,
        address: body.address,
        avatar_url: body.avatar_url,
      };
      email = body.email;
      password = body.password;

      // SMART DETECTION: Jika avatar_url adalah Base64, upload ke Cloudinary
      if (updateFields.avatar_url && updateFields.avatar_url.startsWith('data:image')) {
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(
            updateFields.avatar_url,
            { 
              folder: 'sf-service/profiles', 
              format: 'webp' 
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
        });
        updateFields.avatar_url = (uploadResult as any).secure_url;
      }
    }

    // 4. Update data Auth (email/password) jika ada
    if (email || password) {
      const authUpdate: any = {};
      if (email) authUpdate.email = email;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        authUpdate.password = await bcrypt.hash(password, salt);
      }

      const { error: authError } = await supabaseAdmin
        .from('auth_users')
        .update(authUpdate)
        .eq('id', existingProfile.user_id);

      if (authError) {
        if (authError.code === '23505') {
          return NextResponse.json({ error: 'Email sudah digunakan oleh akun lain.' }, { status: 400 });
        }
        throw authError;
      }
    }

    // Bersihkan field yang tidak ingin diupdate (jika undefined)
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

    // 5. Update data Profil
    const { data, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (profileError) throw profileError;

    return NextResponse.json({ 
      message: 'Profil dan kredensial berhasil diperbarui',
      data 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Update Profile Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verifikasi Identitas dari HttpOnly Cookie
    const token = request.cookies.get('token')?.value;
    
    if (!token || !(await verifySessionToken(token))) {
      return NextResponse.json({ error: 'Sesi habis atau tidak sah. Silakan login kembali.' }, { status: 401 });
    }

    const { id } = await params;
    const { error } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
