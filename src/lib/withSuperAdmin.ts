import { NextResponse, NextRequest } from 'next/server';
import { verifySessionToken } from './session';

/**
 * Higher-Order Function untuk memproteksi API route.
 * Hanya mengizinkan role 'super admin'.
 */
export function withSuperAdmin(
  handler: (request: NextRequest, session: any) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      // 1. Ambil token dari cookie
      const token = request.cookies.get('token')?.value;

      if (!token) {
        return NextResponse.json(
          { error: 'Tidak terautentikasi. Silakan login kembali.' },
          { status: 401 }
        );
      }

      // 2. Verifikasi token
      const session = await verifySessionToken(token);

      if (!session) {
        return NextResponse.json(
          { error: 'Sesi tidak valid atau telah kadaluarsa.' },
          { status: 401 }
        );
      }

      // 3. Cek role (harus 'super admin')
      if (session.role !== 'super admin') {
        return NextResponse.json(
          { error: 'Akses ditolak. Anda bukan super admin.' },
          { status: 403 }
        );
      }

      // 4. Lanjutkan ke handler asli dengan menyertakan data session
      return await handler(request, session);
    } catch (error: any) {
      console.error('Super Admin Guard Error:', error);
      return NextResponse.json(
        { error: 'Terjadi kesalahan sistem.' },
        { status: 500 }
      );
    }
  };
}
