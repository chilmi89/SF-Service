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
 *     description: |
 *       Mengupdate progres pengerjaan (status) dari suatu tugas.
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Pengecekan otorisasi (Hanya Teknisi, Admin, atau Owner yang berhak).
 *       2. Memperbarui kolom `status_tugas` di tabel `tasks` secara spesifik.
 *       3. **Otomatisasi Lanjutan**: Apabila status diubah menjadi teks `Selesai`, sistem akan memicu trigger otomatis yang juga mengubah status *Order* bersangkutan menjadi `menunggu pembayaran` (status ID = 7).
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
 *     description: |
 *       Membatalkan / menghapus tugas secara permanen.
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Pengecekan otorisasi tingkat tinggi (Hanya Owner/Admin).
 *       2. Menghapus record baris di tabel `tasks` dari database Supabase.
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

    // Jika task selesai, otomatis update status pesanan menjadi "menunggu pembayaran" (ID = 7)
    if (String(body.status_tugas) === '4' || body.status_tugas?.toLowerCase() === 'selesai') {
      if (data && data.order_id) {
        const { error: orderError } = await supabaseAdmin
          .from('orders')
          .update({ status: 7 })
          .eq('id', data.order_id);
          
        if (orderError) {
          console.error("Gagal mengupdate status pesanan:", orderError.message);
        }
      }
    }

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
