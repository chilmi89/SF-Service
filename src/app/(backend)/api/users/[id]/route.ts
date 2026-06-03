import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Detail user beserta profile dan role
 *     tags: [Users]
 *     description: |
 *       Menampilkan profil komplit dari sebuah akun.
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Mengambil data dari tabel `profiles` berserta *join* (email, role).
 *       2. Meratakan JSON Response agar mudah dibaca.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID profil user
 *     responses:
 *       200:
 *         description: Berhasil mengambil detail user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: string, format: uuid }
 *                     full_name: { type: string }
 *                     phone: { type: string }
 *                     address: { type: string }
 *                     avatar_url: { type: string }
 *                     kode_tenant: { type: string }
 *                     email: { type: string }
 *                     created_at: { type: string, format: date-time }
 *                     role_id: { type: string }
 *                     role_name: { type: string }
 *       404:
 *         description: User tidak ditemukan
 *   put:
 *     summary: Update role user
 *     tags: [Users]
 *     description: |
 *       Mengubah jabatan / otorisasi sebuah akun (Khusus Super Admin).
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Mengambil payload berupa ID `role_id` baru.
 *       2. Mengupdate kolom `role_id` di tabel `profiles`.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_id: { type: string }
 *     responses:
 *       200:
 *         description: Role berhasil diperbarui
 *       400:
 *         description: Role ID wajib diisi
 *   delete:
 *     summary: Hapus user permanen
 *     tags: [Users]
 *     description: |
 *       Mengahapus anggota/pengguna secara keseluruhan dari sistem (Khusus Super Admin).
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Mencari foreign key `user_id` pada tabel profil.
 *       2. Memprioritaskan penghapusan akun utama di tabel `auth_users` terlebih dahulu untuk memastikan tidak ada sisa. Jika tidak ditemukan, baru menghapus tabel `profiles`.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User berhasil dihapus
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

  // Flatten the response
  const flattenedData = {
    id: data.id,
    full_name: data.full_name,
    phone: data.phone,
    address: data.address,
    avatar_url: data.avatar_url,
    kode_tenant: data.kode_tenant,
    email: (data.auth_users as any)?.email || null,
    created_at: (data.auth_users as any)?.created_at || null,
    role_id: (data.roles as any)?.id || null,
    role_name: (data.roles as any)?.name || null
  };

  return NextResponse.json({ data: flattenedData }, { status: 200 });
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
