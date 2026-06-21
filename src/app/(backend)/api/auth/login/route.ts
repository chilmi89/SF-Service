import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createSessionToken } from '@/lib/session';
import { checkRateLimit, incrementRateLimit, resetRateLimit } from '@/lib/rateLimit';

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Melakukan login user (HttpOnly Cookie)
 *     description: |
 *       Memvalidasi kredensial login dan menyimpan sesi di dalam **HttpOnly Cookie** yang aman (Bank Standard).
 *       **Batasan (Rate Limit): Maksimal 5x percobaan login per hari.**
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Menerima email dan password dari body request.
 *       2. **Rate Limiting**: Mengecek riwayat login dari email terkait. Jika mencapai 5x dalam sehari, akan di-blokir sementara.
 *       3. Melakukan pengecekan apakah email terdaftar di database `auth_users`.
 *       3. Memvalidasi password menggunakan algoritma hashing (bcrypt).
 *       4. Jika valid, mengambil role pengguna dan `kode_tenant` dari tabel `profiles`.
 *       5. Menerbitkan JWT (Session Token) yang dikunci ke dalam HttpOnly Cookie (berlaku 24 jam).
 *       6. Mengembalikan respons sukses untuk memicu perpindahan (redirect) ke halaman `/home`.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@user.com
 *               password:
 *                 type: string
 *                 example: mySuperSecretPassword!
 *     responses:
 *       200:
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Login berhasil" }
 *                 redirectPath: { type: string, example: "/admin/dashboard" }
 *                 user:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     email: { type: string }
 *                     role: { type: string }
 *                     created_at: { type: string }
 *       400:
 *         description: Email dan password tidak boleh kosong
 *       401:
 *         description: Email atau password salah
 *       429:
 *         description: Terlalu banyak percobaan login
 *       500:
 *         description: Terjadi kesalahan pada server
 */
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password tidak boleh kosong' },
        { status: 400 }
      );
    }
    
    // 0. Pengecekan Limit (Max 5x Login Gagal per Hari)
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const rateLimit = await checkRateLimit('login', email.toLowerCase(), 5, ONE_DAY_MS, false);
    
    if (!rateLimit.allowed) {
      const hoursLeft = Math.ceil(rateLimit.remainingMs / (60 * 60 * 1000));
      return NextResponse.json(
        { error: `Anda telah mencoba login terlalu banyak hari ini (Maks. 5x). Silakan coba lagi dalam ${hoursLeft} jam.` },
        { status: 429 }
      );
    }

    // 1. Cari user berdasarkan email (Gunakan Admin untuk menembus RLS)
    const { data: user, error: findError } = await supabaseAdmin
      .from('auth_users')
      .select('id, email, password, created_at')
      .eq('email', email)
      .single();

    if (findError || !user) {
      await incrementRateLimit('login', email.toLowerCase(), ONE_DAY_MS);
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // 2. Bandingkan password yang dikirim dengan hash di database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await incrementRateLimit('login', email.toLowerCase(), ONE_DAY_MS);
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // 3. Ambil Profile dan Role user (Gunakan Admin untuk bypass RLS)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, role_id, kode_tenant, roles(name)')
      .eq('user_id', user.id)
      .single();

    const roleName = (profile?.roles as any)?.name;

    // Ambil UUID tenant dari tabel tenants jika user memiliki kode_tenant
    let tenantId = null;
    if (profile?.kode_tenant) {
      const { data: tenant } = await supabaseAdmin
        .from('tenants')
        .select('id')
        .eq('kode_tenant', profile.kode_tenant)
        .single();
      if (tenant) {
        tenantId = tenant.id;
      }
    }

    // Logika Redirect: Semua user diarahkan ke /home setelah login
    // User bisa memilih untuk masuk ke dashboard secara manual nanti
    let redirectPath = '/home';

    // 4. Buat Token Sesi (Session)
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: roleName,
      profileId: profile?.id,
      tenantId: tenantId
    });

    // 4.5. Reset Rate Limit karena login berhasil
    await resetRateLimit('login', email.toLowerCase());

    // 5. Login berhasil - Set Token di HttpOnly Cookie
    const response = NextResponse.json(
      { 
        message: 'Login berhasil', 
        redirectPath: redirectPath,
        profile_id: profile?.id || null
      },
      { status: 200 }
    );

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 hari
    });

    return response;
    
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
