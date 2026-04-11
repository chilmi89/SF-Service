import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

/**
 * Middleware untuk mengizinkan CORS (sementara).
 * Berguna agar laptop lain bisa mengakses API ini melalui IP.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lewati middleware jika ini adalah halaman dokumentasi (agar render HTML tdk rusak)
  if (pathname === '/api/docs') {
    return NextResponse.next();
  }

  // Hanya jalankan middleware ini untuk folder /api
  if (pathname.startsWith('/api')) {
    const response = NextResponse.next();

    // Izinkan semua origin (Hanya untuk testing!)
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight request (OPTIONS)
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { 
        status: 204, 
        headers: response.headers 
      });
    }

    return response;
  }

  return NextResponse.next();
}

// Tentukan rute mana saja yang akan diproses oleh middleware ini
export const config = {
  matcher: '/api/:path*',
};
