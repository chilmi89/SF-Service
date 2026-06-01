import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * @swagger
 * /api/profiles:
 *   get:
 *     summary: Mendapatkan semua daftar profil
 *     tags: [Profiles]
 *     description: |
 *       Menampilkan semua profil pengguna di dalam sistem.
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Mengambil data (query) dari tabel `profiles`.
 *       2. Melakukan Left-Join ke tabel `auth_users` untuk mendapatkan email.
 *       3. Melakukan Left-Join ke tabel `tenants` untuk mendapatkan nama tenant jika pengguna terasosiasi dengan tenant tertentu.
 *       4. Mengembalikan list profil dan membersihkan field internal yang rahasia.
 *     responses:
 *       200:
 *         description: Berhasil mengambil data
 *   post:
 *     summary: Membuat profil baru secara manual
 *     tags: [Profiles]
 *     description: |
 *       Memasukkan profil baru secara manual (biasanya digunakan otomatis pada saat registrasi, tapi tersedia jika butuh import manual).
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Menerima payload berupa ID akun otentikasi (`user_id`), nama, nomor hp, dll.
 *       2. Memasukkannya sebagai record baru di tabel `profiles`.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id: { type: string }
 *               full_name: { type: string }
 *               phone: { type: string }
 *               address: { type: string }
 *               avatar_url: { type: string }
 *     responses:
 *       201:
 *         description: Berhasil dibuat
 */

export async function GET() {
  try {
    // Kueri sekarang lebih sederhana karena kode_tenant sudah ada di tabel profiles
    // Kita tetap join ke tenants jika ingin mengambil data tambahan seperti nama tenant
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*, auth_users(email), tenants(name)');

    if (error) throw error;

    // Tambahkan password kosong dan pastikan data bersih
    const listResponse = data.map((profile: any) => ({
      ...profile,
      email: profile.auth_users?.email || null,
      password: "",
      tenant_name: profile.tenants?.name || null // Opsional: Beri nama tenant agar lebih informatif
    }));

    // Hapus properti internal dan join mentah
    listResponse.forEach((p: any) => {
      delete p.auth_users;
      delete p.tenants;
      delete p.user_id;
      delete p.role_id;
    });

    return NextResponse.json({ data: listResponse }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, full_name, phone, address, avatar_url } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'user_id wajib diisi' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert([{ user_id, full_name, phone, address, avatar_url }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
