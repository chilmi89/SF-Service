import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySessionToken } from '@/lib/session';

/**
 * @swagger
 * /api/tasks/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *   put:
 *     summary: Mengubah status tugas (Untuk Owner/Teknisi)
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status_tugas: { type: string, description: "Status tugas (contoh: Dikerjakan, Selesai)" }
 *     responses:
 *       200:
 *         description: Berhasil diperbarui
 *   delete:
 *     summary: Menghapus tugas (Hanya Owner)
 *     tags: [Tasks]
 *     responses:
 *       204:
 *         description: Berhasil dihapus
 */

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifySessionToken(token) : null;
    
    if (!session) {
      return NextResponse.json({ error: 'Tidak sah' }, { status: 401 });
    }

    const role = (session as any).role?.toLowerCase();
    
    // Hanya owner/admin atau teknisi yang boleh ubah status task
    if (!['owner', 'owner tunggal', 'owner_tunggal', 'admin tenant', 'teknisi'].includes(role)) {
      return NextResponse.json({ error: 'Hanya Teknisi atau Owner yang dapat merubah status tugas' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update({ status_tugas: body.status_tugas })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data, message: 'Status tugas berhasil diperbarui' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifySessionToken(token) : null;
    
    if (!session) {
      return NextResponse.json({ error: 'Tidak sah' }, { status: 401 });
    }

    const role = (session as any).role?.toLowerCase();
    
    // Hanya owner/admin yang boleh hapus task
    if (!['owner', 'owner tunggal', 'owner_tunggal', 'admin tenant'].includes(role)) {
      return NextResponse.json({ error: 'Hanya Owner atau Admin yang dapat menghapus tugas' }, { status: 403 });
    }

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
