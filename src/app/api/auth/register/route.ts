import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Melakukan registrasi user baru
 *     description: Mendaftarkan email dan password ke dalam sistem dan menyimpannya di auth_users.
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
 *       201:
 *         description: Registrasi berhasil
 *       400:
 *         description: Email dan password tidak boleh kosong
 *       409:
 *         description: Email sudah terdaftar
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

    // 1. Cek apakah email sudah terdaftar
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('auth_users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 409 }
      );
    }

    // 2. Hash password menggunakan bcryptjs
    // Angka 10 adalah salt rounds (default standar yang aman)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Masukkan data user baru ke tabel auth_users
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('auth_users')
      .insert([
        {
          email: email,
          password: hashedPassword,
        },
      ])
      .select('id, email, created_at')
      .single();

    if (insertError) {
      console.error('Error saat insert ke Supabase:', insertError);
      return NextResponse.json(
        { error: 'Gagal mendaftar user baru' },
        { status: 500 }
      );
    }

    // 4. Cari role_id dari tabel roles untuk "user biasa" (sebagai role default pendaftaran publik)
    let roleId = null;
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', 'user biasa')
      .single();

    if (roleData) {
      roleId = roleData.id;
    } else {
      console.warn(`Role "user biasa" tidak ditemukan di database.`);
    }

    // 5. Masukkan data ke tabel profiles hanya user_id dan role_id
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([
        {
          user_id: newUser.id,
          role_id: roleId,
        },
      ]);

    if (profileError) {
      console.error('Error saat membuat profile baru:', profileError);
    }

    return NextResponse.json(
      { message: 'Registrasi berhasil, dan profile berhasil dibuat', user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register API Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
