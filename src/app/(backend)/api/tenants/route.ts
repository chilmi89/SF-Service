import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySessionToken } from '@/lib/session';
import { checkProfileCompletion } from '@/lib/profile';

/**
 * @swagger
 * /api/tenants:
 *   get:
 *     summary: Mengambil semua daftar tenant
 *     tags: [Tenants]
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
 *     description: Slug dan Kode Tenant akan di-generate otomatis oleh sistem.
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
 *               image_url: { type: string, description: "URL Gambar (Opsional)" }
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

    // 4. Cek kelengkapan profile (Nama & Telepon tidak boleh kosong/hanya spasi)
    const isProfileComplete = 
      currentProfile?.full_name && currentProfile.full_name.trim() !== "" &&
      currentProfile?.phone && currentProfile.phone.trim() !== "";

    if (!isProfileComplete) {
      return NextResponse.json({ 
        error: 'Profil belum lengkap. Silakan lengkapi Nama Lengkap dan Nomor Telepon di profil Anda terlebih dahulu.',
        code: 'INCOMPLETE_PROFILE'
      }, { status: 403 });
    }

    const body = await request.json();
    const { name, address, phone, image_url } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nama Tenant wajib diisi' }, { status: 400 });
    }

    // 5. Otomasi Slug dan Kode Tenant
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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
    // Mencari role ID untuk 'owner tunggal'
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

    return NextResponse.json({ 
      data: newTenant, 
      message: `Selamat! Tenant berhasil dibuat dengan Kode: ${generatedKode}. Akun Anda kini telah menjadi Owner.` 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Terjadi kesalahan internal saat mendaftarkan tenant baru.' }, { status: 500 });
  }
}
