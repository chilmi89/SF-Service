import { NextResponse, NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Route Protection untuk Super Admin
  if (pathname.startsWith('/dashboard/superadmin')) {
    const token = request.cookies.get('token')?.value;

    // Jika tidak ada token (belum login)
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verifikasi token
    const session = await verifySessionToken(token);

    // Jika token tidak valid atau role-nya bukan 'super admin'
    if (!session || session.role !== 'super admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 2. CORS Proxy Logic untuk API routes (diadaptasi dari proxy.ts)
  if (pathname.startsWith('/api')) {
    if (pathname === '/api/docs') {
      return NextResponse.next();
    }

    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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

// Konfigurasi matcher untuk rute mana saja yang akan dicegat middleware
export const config = {
  matcher: [
    '/dashboard/superadmin',
    '/dashboard/superadmin/:path*',
    '/api/:path*'
  ],
};
