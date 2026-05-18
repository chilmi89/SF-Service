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
      .select('*');

    // Jika bukan Super Admin, filter berdasarkan tenant milik user
    if (userRole !== 'super admin' && userRole !== 'superadmin') {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('kode_tenant')
        .eq('user_id', userId)
        .single();
      
      if (profile?.kode_tenant) {
        const { data: tenantData } = await supabaseAdmin
          .from('tenants')
          .select('id')
          .eq('kode_tenant', profile.kode_tenant)
          .single();
          
        if (tenantData?.id) {
            query = query.eq('kode_tenant', tenantData.id);
        } else {
            return NextResponse.json({ data: [] }, { status: 200 });
        }
      } else {
        return NextResponse.json({ data: [] }, { status: 200 });
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase Error (GET Langganan_tenant):', error);
      throw error;
    }

    if (data && data.length > 0) {
      const tenantIds = [...new Set(data.map(item => item.kode_tenant))].filter(Boolean);
      const langgananIds = [...new Set(data.map(item => item.id_langganan))].filter(Boolean);

      const { data: tenantsData } = await supabaseAdmin
        .from('tenants')
        .select('id, name, slug')
        .in('id', tenantIds);

      const { data: langganansData } = await supabaseAdmin
        .from('Langganan')
        .select('*')
        .in('id', langgananIds);

      const enrichedData = data.map(item => {
        return {
          ...item,
          Langganan: langganansData?.find(l => l.id === item.id_langganan) || null,
          tenants: tenantsData?.find(t => t.id === item.kode_tenant) || null
        };
      });

      return NextResponse.json({ data: enrichedData }, { status: 200 });
    }

    return NextResponse.json({ data: [] }, { status: 200 });
  } catch (error: any) {
    console.error('Error GET Langganan_tenant:', error);
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

    // --- LOGIKA UPGRADE ROLE OWNER ---
    try {
      // 1. Ambil UUID role 'owner' dan 'owner tunggal'
      const { data: roles } = await supabaseAdmin
        .from('roles')
        .select('id, name')
        .in('name', ['owner', 'owner tunggal']);
      
      const roleOwner = roles?.find(r => r.name === 'owner');
      const roleOwnerTunggal = roles?.find(r => r.name === 'owner tunggal');

      if (roleOwner && roleOwnerTunggal) {
        // 2. Cari kode_tenant (string) untuk tenant tersebut
        const { data: tenantData } = await supabaseAdmin
          .from('tenants')
          .select('kode_tenant')
          .eq('id', targetTenantId)
          .single();
        
        if (tenantData) {
          // 3. Update profil yang memiliki kode_tenant tersebut dan role 'owner tunggal'
          await supabaseAdmin
            .from('profiles')
            .update({ role_id: roleOwner.id })
            .eq('kode_tenant', tenantData.kode_tenant)
            .eq('role_id', roleOwnerTunggal.id);
          
          console.log(`Role owner untuk tenant ${tenantData.kode_tenant} berhasil di-upgrade ke 'owner'.`);
        }
      }
    } catch (roleUpdateError) {
      console.error('Gagal mengupdate role owner setelah langganan:', roleUpdateError);
      // Kita tidak throw error di sini agar transaksi langganan tetap dianggap berhasil
    }

    return NextResponse.json({ data, message: 'Tenant berhasil didaftarkan ke paket langganan dan role telah diperbarui.' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mendaftarkan langganan tenant.' }, { status: 500 });
  }
}
