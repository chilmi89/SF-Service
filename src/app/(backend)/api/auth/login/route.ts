import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createSessionToken } from '@/lib/session';

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Melakukan login user (HttpOnly Cookie)
 *     description: Memvalidasi kredensial login dan menyimpan sesi di dalam **HttpOnly Cookie** yang aman (Bank Standard).
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

    // 1. Cari user berdasarkan email (Gunakan Admin untuk menembus RLS)
    const { data: user, error: findError } = await supabaseAdmin
      .from('auth_users')
      .select('id, email, password, created_at')
      .eq('email', email)
      .single();

    if (findError || !user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // 2. Bandingkan password yang dikirim dengan hash di database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // 3. Ambil Profile dan Role user (Gunakan Admin untuk bypass RLS)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, role_id, roles(name)')
      .eq('user_id', user.id)
      .single();

    let redirectPath = '/';
    const roleName = (profile?.roles as any)?.name;

    // Logika Redirect (Diprioritaskan dari yang paling spesifik)
    if (roleName === 'super admin') {
      redirectPath = '/dashboard/superadmin';
    } else if (roleName === 'owner tunggal') {
      redirectPath =  '/dashboard/owner_tunggal';
    } else if (roleName === 'admin tenant' || roleName === 'owner') {
      redirectPath = '/dashboard/admin';
    } else if (roleName === 'teknisi') {
      redirectPath = '/dashboard/teknisi';
    } else if (roleName === 'user biasa') {
      redirectPath = '/home';
    }

    // 4. Buat Token Sesi (Session)
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: roleName,
      profileId: profile?.id
    });

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
