import { NextResponse, NextRequest } from 'next/server';
import { verifySessionToken, createSessionToken } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // --- TRANSISI ROLE OTOMATIS (OWNER TUNGGAL -> OWNER) ---
  if (token && pathname.startsWith('/dashboard')) {
    const session = await verifySessionToken(token);
    
    if (session && session.role === 'owner tunggal') {
      // 1. Dapatkan kode_tenant pemilik
      const { data: ownerProfile } = await supabaseAdmin
        .from('profiles')
        .select('kode_tenant')
        .eq('user_id', session.userId)
        .single();

      if (ownerProfile?.kode_tenant) {
        // 2. Cek apakah ada profil lain (staf/teknisi) yang memiliki kode_tenant ini
        const { count, error } = await supabaseAdmin
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('kode_tenant', ownerProfile.kode_tenant)
          .neq('user_id', session.userId);

        if (count && count > 0 && !error) {
          // 3. Ambil UUID role 'owner' biasa
          const { data: roleOwner } = await supabaseAdmin
            .from('roles')
            .select('id')
            .eq('name', 'owner')
            .single();

          if (roleOwner) {
            // 4. Upgrade role pemilik di database
            await supabaseAdmin
              .from('profiles')
              .update({ role_id: roleOwner.id })
              .eq('user_id', session.userId);

            // 5. Buat token sesi baru dengan role 'owner'
            const updatedSession = { ...session, role: 'owner' };
            const newToken = await createSessionToken(updatedSession);

            // 6. Refresh halaman dengan cookie token yang diperbarui
            const redirectUrl = new URL(request.url);
            const response = NextResponse.redirect(redirectUrl);
            response.cookies.set('token', newToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 // 24 Jam
            });
            return response;
          }
        }
      }
    }
  }

  // 1. Route Protection untuk Super Admin
  if (pathname.startsWith('/dashboard/superadmin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (session.role !== 'super admin') {
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }
  }

  // 1.1 Route Protection untuk Admin (Tenants)
  if (pathname.startsWith('/dashboard/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    if (session.role !== 'admin') {
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }
  }

  // 1.3 Route Protection untuk Owner (Tunggal & Biasa)
  if (pathname.startsWith('/dashboard/owner')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    // Izinkan baik 'owner' maupun 'owner tunggal'
    if (session.role !== 'owner' && session.role !== 'owner tunggal') {
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }

    // --- PROTEKSI AKSES BERLANGGANAN UNTUK MENU STAFF ---
    if (pathname.startsWith('/dashboard/owner/staff')) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('kode_tenant')
        .eq('user_id', session.userId)
        .single();

      if (!profile?.kode_tenant) {
        return NextResponse.redirect(new URL('/forbidden', request.url));
      }

      const { data: tenant } = await supabaseAdmin
        .from('tenants')
        .select('id')
        .eq('kode_tenant', profile.kode_tenant)
        .single();

      if (!tenant) {
        return NextResponse.redirect(new URL('/forbidden', request.url));
      }

      const { data: subscriptions } = await supabaseAdmin
        .from('Langganan_tenant')
        .select('id')
        .eq('kode_tenant', tenant.id);

      if (!subscriptions || subscriptions.length === 0) {
        return NextResponse.redirect(new URL('/dashboard/owner/subscription?error=unsubscribed', request.url));
      }
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
    '/dashboard/owner/:path*',
    '/api/:path*'
  ],
};
