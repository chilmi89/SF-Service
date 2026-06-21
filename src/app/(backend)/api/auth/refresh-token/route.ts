import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createSessionToken, verifySessionToken } from '@/lib/session';

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Memperbarui Session Token (Role/Tenant ID)
 *     description: |
 *       Membaca cookie session yang ada, mengambil ulang data role dan tenant terbaru dari database, 
 *       lalu mencetak ulang JWT dan menyimpannya kembali di HttpOnly Cookie.
 *       Gunakan endpoint ini secara transparan di frontend setelah user merubah role (misal daftar tenant).
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Sesi berhasil diperbarui
 *       401:
 *         description: Tidak sah atau sesi kedaluwarsa
 *       500:
 *         description: Terjadi kesalahan pada server
 */
export async function POST(request: NextRequest) {
  try {
    const currentToken = request.cookies.get('token')?.value;
    
    if (!currentToken) {
      return NextResponse.json({ error: 'Sesi tidak ditemukan' }, { status: 401 });
    }

    const session = await verifySessionToken(currentToken);
    
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Sesi tidak valid' }, { status: 401 });
    }

    // 1. Ambil Profile dan Role user (Gunakan Admin untuk bypass RLS)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, role_id, kode_tenant, roles(name)')
      .eq('user_id', session.userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Gagal mengambil data profil' }, { status: 500 });
    }

    const roleName = (profile?.roles as any)?.name;

    // Ambil UUID tenant dari tabel tenants jika user memiliki kode_tenant
    let tenantId = null;
    if (profile?.kode_tenant) {
      const { data: tenant } = await supabaseAdmin
        .from('tenants')
        .select('id')
        .eq('kode_tenant', profile.kode_tenant)
        .single();
      if (tenant) {
        tenantId = tenant.id;
      }
    }

    // 2. Buat Token Sesi (Session) Baru
    const newToken = await createSessionToken({
      userId: session.userId,
      email: session.email,
      role: roleName,
      profileId: profile?.id,
      tenantId: tenantId
    });

    // 3. Set Token Baru di HttpOnly Cookie
    const response = NextResponse.json(
      { message: 'Sesi berhasil diperbarui' },
      { status: 200 }
    );

    response.cookies.set({
      name: 'token',
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 hari
    });

    return response;
    
  } catch (error) {
    console.error('Refresh Token API Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat memperbarui sesi' },
      { status: 500 }
    );
  }
}
