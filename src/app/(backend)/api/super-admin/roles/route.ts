import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * @swagger
 * /api/super-admin/roles:
 *   get:
 *     summary: Ambil semua daftar role
 *     description: Mengembalikan daftar semua role yang ada di sistem (Role statis/manual dari DB)
 *     tags: [Super Admin]
 *     responses:
 *       200:
 *         description: Berhasil mengambil data roles
 */

export async function GET(request: NextRequest) {
  const { data, error } = await supabaseAdmin
    .from('roles')
    .select('*')
    .order('name');

  if (error) throw error;
  return NextResponse.json({ data }, { status: 200 });
}
