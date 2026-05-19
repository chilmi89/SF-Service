import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySessionToken } from '@/lib/session';

/**
 * @swagger
 * /api/orders/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *   get:
 *     summary: Melihat detail pesanan
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Berhasil
 *   put:
 *     summary: Mengubah status pesanan (Untuk Owner)
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status_order: { type: string, description: "Status pesanan (contoh: Diterima, Ditolak)" }
 *     responses:
 *       200:
 *         description: Berhasil diperbarui
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Join dengan transactions dan layanan
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        layanan (nama_layanan, harga_dasar, tenant_id),
        transactions (invoice_number, total_bayar, status_pembayaran)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
    
    // Hanya owner/admin tenant yang boleh ubah status
    if (!['owner', 'owner tunggal', 'owner_tunggal', 'admin tenant'].includes(role)) {
      return NextResponse.json({ error: 'Hanya Owner atau Admin yang dapat merubah status pesanan' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status_order: body.status_order })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data, message: 'Status pesanan berhasil diperbarui' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
