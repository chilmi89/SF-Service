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

    // Jika token tidak valid
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Jika role-nya bukan 'super admin'
    if (session.role !== 'super admin') {
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }
  }

  // 1.1 Route Protection untuk Admin (Tenants)
  if (pathname.startsWith('/dashboard/admin')) {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (session.role !== 'admin') {
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }
  }

  // 1.2 Route Protection untuk Teknisi
  if (pathname.startsWith('/dashboard/teknisi')) {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (session.role !== 'teknisi') {
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }
  }

  // 1.3 Route Protection untuk Owner Tunggal
  if (pathname.startsWith('/dashboard/owner_tunggal')) {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Mencocokkan dengan nama role di database ('owner tunggal')
    if (session.role !== 'owner tunggal') {
      return NextResponse.redirect(new URL('/forbidden', request.url));
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
    '/dashboard/superadmin/:path*',
    '/dashboard/admin/:path*',
    '/dashboard/teknisi/:path*',
    '/dashboard/owner_tunggal/:path*',
    '/api/:path*'
  ],
};
