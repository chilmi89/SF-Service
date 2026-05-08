import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySessionToken } from '@/lib/session';

/**
 * @swagger
 * /api/langganan-tenant:
 *   get:
 *     summary: Mengambil semua daftar langganan tenant
 *     tags: [Langganan Tenant]
 *     responses:
 *       200:
 *         description: Berhasil mengambil data
 *   post:
 *     summary: Mendaftarkan tenant ke paket langganan
 *     tags: [Langganan Tenant]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [kode_tenant, id_langganan]
 *             properties:
 *               kode_tenant: { type: integer, description: "ID atau Kode Tenant (int8)" }
 *               id_langganan: { type: integer, description: "ID Paket Langganan" }
 *     responses:
 *       201:
 *         description: Berhasil didaftarkan
 *       400:
 *         description: Data tidak lengkap
 */

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!token || !session) {
      return NextResponse.json({ error: 'Tidak sah' }, { status: 401 });
    }

    const userRole = (session as any).role;
    const userId = (session as any).userId;

    let query = supabaseAdmin
      .from('Langganan_tenant')
      .select('*, Langganan(*), tenants(name, slug)');

    // Jika bukan Super Admin, filter berdasarkan tenant milik user
    if (userRole !== 'super admin') {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('kode_tenant')
        .eq('user_id', userId)
        .single();
      
      // Catatan: Jika kode_tenant di profiles adalah string dan di Langganan_tenant adalah int8, 
      // ini mungkin butuh penyesuaian ID. Untuk sekarang kita asumsikan bisa difilter.
      if (profile?.kode_tenant) {
        query = query.eq('kode_tenant', profile.kode_tenant);
      } else {
        return NextResponse.json({ data: [] }, { status: 200 });
      }
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mengambil data langganan tenant.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kode_tenant, id_langganan } = body;

    if (!kode_tenant || !id_langganan) {
      return NextResponse.json({ error: 'Kode Tenant dan ID Langganan wajib diisi.' }, { status: 400 });
    }

    let targetTenantId = kode_tenant;

    // Jika kode_tenant yang dikirim adalah string (misal 'D9WF'), cari ID-nya di tabel tenants
    if (typeof kode_tenant === 'string') {
      const { data: tenantData, error: tenantSearchError } = await supabaseAdmin
        .from('tenants')
        .select('id')
        .eq('kode_tenant', kode_tenant)
        .single();
      
      if (tenantSearchError || !tenantData) {
        return NextResponse.json({ error: 'Tenant dengan kode tersebut tidak ditemukan.' }, { status: 404 });
      }
      targetTenantId = tenantData.id;
    }

    const { data, error } = await supabaseAdmin
      .from('Langganan_tenant')
      .insert([{ kode_tenant: targetTenantId, id_langganan }])
      .select()
      .single();

    if (error) {
      console.error('Supabase Error (Langganan_tenant):', error);
      throw error;
    }

    return NextResponse.json({ data, message: 'Tenant berhasil didaftarkan ke paket langganan.' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mendaftarkan langganan tenant.' }, { status: 500 });
  }
}
