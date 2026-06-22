import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * @swagger
 * /api/kategori:
 *   get:
 *     summary: Mengambil daftar kategori layanan
 *     description: |
 *       Menampilkan semua data kategori layanan.
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Mengambil data dari tabel `Kategori_layanan` secara urut (ascending).
 *       2. Mengembalikan daftar data kategori ke klien (bisa diakses oleh siapa saja).
 *     tags: [Layanan (User)]
 *     responses:
 *       200:
 *         description: Berhasil mengambil data kategori
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('Kategori_layanan')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    
    return NextResponse.json({ data}, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
