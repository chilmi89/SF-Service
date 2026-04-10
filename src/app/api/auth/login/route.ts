import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase'; // Menyesuaikan dengan letak supabase.ts kita

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Melakukan login user
 *     description: Memvalidasi kredensial login (email dan password) dan mengembalikan data basic user (tanpa token aktif jika hanya basic auth).
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

    // 1. Cari user berdasarkan email
    const { data: user, error: findError } = await supabase
      .from('auth_users')
      .select('id, email, password, created_at')
      .eq('email', email)
      .single();

    if (findError || !user) {
      // Lebih aman menggunakan pesan generik saat login gagal
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

    // 3. Login berhasil (Jangan kembalikan password di response)
    return NextResponse.json(
      { 
        message: 'Login berhasil', 
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        }
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
