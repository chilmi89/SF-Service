import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySessionToken } from '@/lib/session';

/**
 * @swagger
 * /api/tenants/staff/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: UUID Profile Staff yang akan dihapus
 *   delete:
 *     summary: Menghapus staf dari tenant (Kembalikan ke user biasa)
 *     tags: [Tenants Staff]
 *     description: |
 *       Memecat/mengeluarkan staf dari keanggotaan tenant.
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Pengecekan otorisasi: Hanya Owner dari tenant tersebut atau Super Admin yang berhak menghapus.
 *       2. Memperbarui `profiles` staf bersangkutan: menghapus `kode_tenant` (di-set null) dan me-reset hak akses / Role kembali menjadi `user biasa`.
 *     responses:
 *       200:
 *         description: Berhasil dihapus
 *       403:
 *         description: Tidak memiliki izin
 */

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!token || !session) {
      return NextResponse.json({ error: 'Tidak sah' }, { status: 401 });
    }

    const { id } = await params;
    const ownerId = (session as any).userId;
    const ownerRole = (session as any).role;

    // 1. Ambil data staff target untuk verifikasi kepemilikan
    const { data: targetProfile } = await supabaseAdmin
      .from('profiles')
      .select('kode_tenant, user_id')
      .eq('id', id)
      .single();

    if (!targetProfile) {
      return NextResponse.json({ error: 'Data staf tidak ditemukan.' }, { status: 404 });
    }

    // 2. Ambil kode_tenant si Owner untuk memastikan dia berhak menghapus staf di tenantnya
    const { data: ownerProfile } = await supabaseAdmin
      .from('profiles')
      .select('kode_tenant')
      .eq('user_id', ownerId)
      .single();

    if (ownerRole !== 'super admin' && ownerProfile?.kode_tenant !== targetProfile.kode_tenant) {
      return NextResponse.json({ error: 'Akses ditolak. Anda tidak berhak menghapus staf ini.' }, { status: 403 });
    }

    // 3. Ambil UUID Role 'user biasa' untuk reset
    const { data: normalRole } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', 'user biasa')
      .single();

    if (!normalRole) throw new Error('Role user biasa tidak ditemukan.');

    // 4. Update Profile: Hapus kode_tenant dan reset role
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        kode_tenant: null,
        role_id: normalRole.id
      })
      .eq('id', id);

    if (updateError) throw updateError;

    return NextResponse.json({ message: 'Staf berhasil dihapus dari tenant.' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal menghapus staf.' }, { status: 500 });
  }
}
