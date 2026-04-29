import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Detail user beserta profile dan role
 *     tags: [Users]
 *   put:
 *     summary: Update role user
 *     tags: [Users]
 *   delete:
 *     summary: Hapus user permanen
 *     tags: [Users]
 */

export async function GET(request: NextRequest) {
  const segments = request.nextUrl.pathname.split('/');
  const id = segments[segments.length - 1]; // id profile

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
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ data }, { status: 200 });
}

export async function PUT(request: NextRequest) {
  const segments = request.nextUrl.pathname.split('/');
  const id = segments[segments.length - 1]; // id profile
  const { role_id } = await request.json();

  if (!role_id) {
    return NextResponse.json({ error: 'Role ID wajib diisi' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ role_id })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json({ data, message: 'Role user berhasil diperbarui' }, { status: 200 });
}

export async function DELETE(request: NextRequest) {
  const segments = request.nextUrl.pathname.split('/');
  const id = segments[segments.length - 1]; // id profile

  // Ambil ID auth_user dulu karena kita ingin hapus user utamanya
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('user_id')
    .eq('id', id)
    .single();

  if (profile?.user_id) {
    const { error } = await supabaseAdmin
      .from('auth_users')
      .delete()
      .eq('id', profile.user_id);
      
    if (error) throw error;
  } else {
     // Jika tidak ada user_id, hapus profilnya saja
     await supabaseAdmin.from('profiles').delete().eq('id', id);
  }

  return NextResponse.json({ message: 'User berhasil dihapus' }, { status: 200 });
}
