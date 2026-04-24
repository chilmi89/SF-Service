import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { withSuperAdmin } from '@/lib/withSuperAdmin';

/**
 * @swagger
 * /api/super-admin/role-permissions:
 *   get:
 *     summary: Ambil daftar permission (semua atau difilter per role)
 *     description: >
 *       Jika `role_id` diberikan, akan mengembalikan semua permission dengan status aktif/nonaktif
 *       (assigned) untuk role tersebut. Jika `role_id` kosong, mengembalikan seluruh permission.
 *     tags: [Super Admin]
 *     parameters:
 *       - in: query
 *         name: role_id
 *         schema:
 *           type: string
 *         description: UUID role (Opsional)
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar permission
 *       404:
 *         description: Role tidak ditemukan
 *   post:
 *     summary: Buat permission baru & langsung assign ke role
 *     tags: [Super Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, role_ids]
 *             properties:
 *               name: { type: string, example: "download_laporan" }
 *               role_ids:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       201:
 *         description: Permission berhasil dibuat dan di-assign
 *       400:
 *         description: Request body tidak valid atau nama permission sudah ada
 *   put:
 *     summary: Update nama permission
 *     tags: [Super Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [permission_id, name]
 *             properties:
 *               permission_id: { type: string }
 *               name: { type: string, example: "nama_baru_permission" }
 *     responses:
 *       200:
 *         description: Berhasil update nama permission
 *       400:
 *         description: Parameter tidak lengkap atau nama sudah ada
 *   delete:
 *     summary: Hapus permission secara permanen dari sistem
 *     tags: [Super Admin]
 *     parameters:
 *       - in: query
 *         name: permission_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Permission berhasil dihapus total dari database
 *       400:
 *         description: permission_id tidak disertakan dalam query
 */

// 1. GET: Semua permission atau filter per role
export const GET = withSuperAdmin(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const roleId = searchParams.get('role_id');

  // Ambil SEMUA permission
  const { data: allPermissions, error: permError } = await supabaseAdmin
    .from('permissions')
    .select('id, name')
    .order('name');
  if (permError) throw permError;

  // Jika tanpa filter, kembalikan semua permission saja
  if (!roleId) {
    return NextResponse.json({ permissions: allPermissions }, { status: 200 });
  }

  // Jika filter role_id ada, ambil data role & mapping status assigned
  const { data: role, error: roleError } = await supabaseAdmin
    .from('roles')
    .select('id, name')
    .eq('id', roleId)
    .single();

  if (roleError || !role) {
    return NextResponse.json({ error: 'Role tidak ditemukan' }, { status: 404 });
  }

  const { data: assignedPerms, error: assignError } = await supabaseAdmin
    .from('role_permissions')
    .select('permission_id')
    .eq('role_id', roleId);

  if (assignError) throw assignError;

  const assignedIds = new Set(assignedPerms?.map((p) => p.permission_id));
  const permissions = (allPermissions || []).map((perm) => ({
    id: perm.id,
    name: perm.name,
    assigned: assignedIds.has(perm.id),
  }));

  return NextResponse.json({ role, permissions }, { status: 200 });
});

// 2. POST: Tambah permission baru (sekalian pilih role mana yg langsung dapat)
export const POST = withSuperAdmin(async (request: NextRequest) => {
  const body = await request.json();
  const { name, role_ids } = body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Nama permission wajib diisi' }, { status: 400 });
  }
  if (!Array.isArray(role_ids) || role_ids.length === 0) {
    return NextResponse.json({ error: 'Minimal pilih satu role' }, { status: 400 });
  }

  const { data: newPermission, error: permError } = await supabaseAdmin
    .from('permissions')
    .insert([{ name: name.trim() }])
    .select()
    .single();

  if (permError) {
    if (permError.code === '23505') return NextResponse.json({ error: 'Permission sudah ada' }, { status: 400 });
    throw permError;
  }

  const assignments = role_ids.map((roleId: string) => ({
    role_id: roleId,
    permission_id: newPermission.id,
  }));

  const { error: assignError } = await supabaseAdmin.from('role_permissions').upsert(assignments);
  if (assignError) throw assignError;

  return NextResponse.json({
    message: 'Permission berhasil dibuat dan di-assign',
    data: newPermission
  }, { status: 201 });
});

// 3. PUT: Update nama permission
export const PUT = withSuperAdmin(async (request: NextRequest) => {
  const { permission_id, name } = await request.json();

  if (!permission_id || !name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Butuh permission_id dan name untuk update' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('permissions')
    .update({ name: name.trim() })
    .eq('id', permission_id);

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Nama permission sudah dipakai' }, { status: 400 });
    throw error;
  }

  return NextResponse.json({ message: 'Nama permission berhasil diupdate' }, { status: 200 });
});

// 4. DELETE: Hapus permission permanen dari DB berdasarkan ID
export const DELETE = withSuperAdmin(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const permissionId = searchParams.get('permission_id');

  if (!permissionId) {
    return NextResponse.json({ error: 'Parameter permission_id wajib diisi' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('permissions').delete().eq('id', permissionId);
  if (error) throw error;

  return NextResponse.json({ message: 'Permission berhasil dihapus dari sistem' }, { status: 200 });
});
