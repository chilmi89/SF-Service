import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: |
 *       Menghapus token otentikasi dari cookie browser.
 *       
 *       **Alur Kerja (Workflow):**
 *       1. API Menerima request pemutusan sesi.
 *       2. Menginstruksikan browser untuk mengubah tanggal kedaluwarsa cookie `token` ke masa lalu (menjadi tidak valid).
 *       3. Browser secara otomatis akan menghapus token otentikasi pengguna.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Logout berhasil
 */
export async function POST() {
  const response = NextResponse.json(
    { message: 'Logout berhasil' },
    { status: 200 }
  );

  // Menghapus cookie dengan cara menset masa kadaluwarsa ke masa lalu
  response.cookies.set({
    name: 'token',
    value: '',
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}
