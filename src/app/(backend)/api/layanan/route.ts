import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySessionToken } from '@/lib/session';

/**
 * @swagger
 * /api/layanan:
 *   get:
 *     summary: Mengambil daftar layanan
 *     tags: [Layanan]
 *     parameters:
 *       - in: query
 *         name: tenant_id
 *         schema:
 *           type: string
 *         description: Filter layanan berdasarkan ID Tenant
 *     responses:
 *       200:
 *         description: Berhasil
 *   post:
 *     summary: Menambah layanan baru
 *     tags: [Layanan]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tenant_id, nama_layanan, harga_dasar]
 *             properties:
 *               tenant_id: { type: string }
 *               nama_layanan: { type: string }
 *               harga_dasar: { type: number }
 *     responses:
 *       201:
 *         description: Layanan dibuat
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant_id');

    let query = supabaseAdmin.from('layanan').select('*, tenants(name)');

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verifikasi Identitas dari HttpOnly Cookie
    const token = request.cookies.get('token')?.value;
    if (!token || !(await verifySessionToken(token))) {
      return NextResponse.json({ error: 'Tidak sah' }, { status: 401 });
    }

    const body = await request.json();
    const { tenant_id, nama_layanan, harga_dasar } = body;

    if (!tenant_id || !nama_layanan || !harga_dasar) {
      return NextResponse.json({ error: 'Tenant ID, Nama Layanan, dan Harga Dasar wajib diisi' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('layanan')
      .insert([{ tenant_id, nama_layanan, harga_dasar }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data, message: 'Layanan berhasil ditambahkan' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
