import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Ambil semua daftar user beserta profile dan role-nya
 *     description: Mengambil data profil lengkap termasuk email dari auth_users dan nama role.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string, format: uuid }
 *                       full_name: { type: string }
 *                       phone: { type: string }
 *                       address: { type: string }
 *                       avatar_url: { type: string }
 *                       kode_tenant: { type: string }
 *                       email: { type: string }
 *                       created_at: { type: string, format: date-time }
 *                       role_id: { type: string }
 *                       role_name: { type: string }
 */

export async function GET(request: NextRequest) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      id,
      full_name,
      phone,
      address,
      avatar_url,
      kode_tenant,
      auth_users (
        id,
        email,
        created_at
      ),
      roles (
        id,
        name
      )
    `);

  if (error) throw error;

  // Flatten the response to avoid nested data (the "double" structure)
  const flattenedData = data.map((user: any) => ({
    id: user.id,
    full_name: user.full_name,
    phone: user.phone,
    address: user.address,
    avatar_url: user.avatar_url,
    kode_tenant: user.kode_tenant,
    email: user.auth_users?.email || null,
    created_at: user.auth_users?.created_at || null,
    role_id: user.roles?.id || null,
    role_name: user.roles?.name || null
  }));

  return NextResponse.json({ data: flattenedData }, { status: 200 });
}
