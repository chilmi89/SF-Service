import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySessionToken } from '@/lib/session';

/**
 * @swagger
 * /api/tenants:
 *   get:
 *     summary: Mengambil semua daftar tenant
 *     tags: [Tenants]
 *     responses:
 *       200:
 *         description: Berhasil mengambil data
 *   post:
 *     summary: Membuat tenant baru
 *     tags: [Tenants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug, kode_tenant]
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *               kode_tenant: { type: string }
 *               address: { type: string }
 *               phone: { type: string }
 *               image_url: { type: string }
 *     responses:
 *       201:
 *         description: Tenant berhasil dibuat
 *       401:
 *         description: Tidak terautentikasi
 */

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .order('name');

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
      return NextResponse.json({ error: 'Tidak sah. Silakan login kembali.' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, kode_tenant, address, phone, image_url } = body;

    if (!name || !slug || !kode_tenant) {
      return NextResponse.json({ error: 'Name, Slug, dan Kode Tenant wajib diisi' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('tenants')
      .insert([{ name, slug, kode_tenant, address, phone, image_url }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Slug atau Kode Tenant sudah digunakan' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ data, message: 'Tenant berhasil dibuat' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
