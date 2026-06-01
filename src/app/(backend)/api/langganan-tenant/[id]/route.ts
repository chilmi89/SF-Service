import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySessionToken } from '@/lib/session';

/**
 * @swagger
 * /api/langganan-tenant/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *   get:
 *     summary: Mendapatkan detail langganan tenant
 *     tags: [Langganan Tenant]
 *     description: |
 *       Menampilkan detail pendaftaran/transaksi langganan seorang tenant.
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Mengambil parameter ID pendaftaran dari URL.
 *       2. Melakukan Fetch dari tabel `Langganan_tenant` dilengkapi JOIN dengan detail paket `Langganan` dan informasi `tenants`.
 *     responses:
 *       200:
 *         description: Berhasil
 *   put:
 *     summary: Memperbarui langganan tenant
 *     tags: [Langganan Tenant]
 *     description: |
 *       Mengedit data kepemilikan paket langganan tenant.
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Mengambil request update `id_langganan` atau `kode_tenant`.
 *       2. Menimpa record pada tabel relasional `Langganan_tenant`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_langganan: { type: integer }
 *               kode_tenant: { type: integer }
 *     responses:
 *       200:
 *         description: Berhasil diperbarui
 *   delete:
 *     summary: Menghapus langganan tenant
 *     tags: [Langganan Tenant]
 *     description: |
 *       Mencabut paket layanan yang terdaftar pada tenant.
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Melakukan hard-delete pada tabel `Langganan_tenant` berdasarkan ID langganan-tenant.
 *     responses:
 *       200:
 *         description: Berhasil dihapus
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from('Langganan_tenant')
      .select('*, Langganan(*), tenants(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Data langganan tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mengambil detail langganan.' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { id_langganan, kode_tenant } = body;

    const { data, error } = await supabaseAdmin
      .from('Langganan_tenant')
      .update({ id_langganan, kode_tenant })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data, message: 'Data langganan berhasil diperbarui.' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memperbarui data langganan.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin
      .from('Langganan_tenant')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Data langganan berhasil dihapus.' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal menghapus data langganan.' }, { status: 500 });
  }
}
