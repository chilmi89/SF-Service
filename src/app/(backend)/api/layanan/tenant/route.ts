import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySessionToken } from '@/lib/session';

/**
 * @swagger
 * /api/layanan/tenant:
 *   get:
 *     summary: Mengambil daftar layanan milik tenant
 *     tags: [Layanan (Tenant)]
 *     description: Endpoint khusus untuk tenant (Owner/Owner Tunggal) agar dapat melihat daftar layanannya sendiri tanpa harus memasukkan ID.
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar layanan
 *       401:
 *         description: Sesi tidak sah
 *       403:
 *         description: Akses ditolak karena user bukan tenant
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verifikasi Identitas dari HttpOnly Cookie
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifySessionToken(token) : null;
    
    if (!token || !session) {
      return NextResponse.json({ error: 'Tidak sah' }, { status: 401 });
    }

    // Pengecekan Role (Hanya Owner & Owner Tunggal)
    const allowedRoles = ['owner', 'owner tunggal', 'owner_tunggal'];
    const userRole = (session.role || '').toLowerCase();
    
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Akses ditolak: Hanya Owner yang dapat melihat layanannya sendiri di endpoint ini' }, { status: 403 });
    }

    const tenant_id = session.tenantId;

    if (!tenant_id) {
      return NextResponse.json({ error: 'Akses ditolak: User bukan bagian dari tenant manapun' }, { status: 403 });
    }

    // Ambil layanan khusus untuk tenant ini
    const { data, error } = await supabaseAdmin
      .from('layanan')
      .select('*, tenants(name)')
      .eq('tenant_id', tenant_id);

    if (error) throw error;

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
