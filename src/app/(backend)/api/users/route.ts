import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Ambil semua daftar user beserta profile dan role-nya
 *     tags: [Users]
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
  return NextResponse.json({ data }, { status: 200 });
}
