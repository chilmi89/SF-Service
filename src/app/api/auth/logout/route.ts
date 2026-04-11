import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Menghapus token otentikasi dari cookie browser.
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
