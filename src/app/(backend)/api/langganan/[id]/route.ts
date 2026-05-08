import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySessionToken } from '@/lib/session';

/**
 * @swagger
 * /api/langganan/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *   get:
 *     summary: Mendapatkan detail paket langganan
 *     tags: [Langganan]
 *     responses:
 *       200:
 *         description: Berhasil mengambil detail paket
 *       404:
 *         description: Paket tidak ditemukan
 *   put:
 *     summary: Memperbarui paket langganan
 *     tags: [Langganan]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               harga: { type: integer }
 *               durasi: { type: integer }
 *     responses:
 *       200:
 *         description: Paket berhasil diperbarui
 *       403:
 *         description: Tidak memiliki izin
 *   delete:
 *     summary: Menghapus paket langganan
 *     tags: [Langganan]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Paket berhasil dihapus
 *       403:
 *         description: Tidak memiliki izin
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from('Langganan')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Paket langganan tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mengambil detail paket langganan.' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!token || !session || (session as any).role !== 'super admin') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const { id } = await params;
    const { harga, durasi } = await request.json();

    const { data, error } = await supabaseAdmin
      .from('Langganan')
      .update({ harga, durasi })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data, message: 'Paket langganan berhasil diperbarui.' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memperbarui paket langganan.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!token || !session || (session as any).role !== 'super admin') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const { id } = await params;
    const { error } = await supabaseAdmin
      .from('Langganan')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Paket langganan berhasil dihapus.' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal menghapus paket langganan.' }, { status: 500 });
  }
}
