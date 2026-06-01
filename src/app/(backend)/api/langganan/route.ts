import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySessionToken } from '@/lib/session';

/**
 * @swagger
 * /api/langganan:
 *   get:
 *     summary: Mengambil semua daftar paket langganan
 *     tags: [Langganan]
 *     description: |
 *       Menampilkan semua data paket langganan aplikasi (misal: Bulanan, Tahunan).
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Langsung mengambil daftar paket berlangganan dari tabel `Langganan`.
 *       2. Mengurutkan paket berdasarkan harga.
 *       3. Mengembalikan array berisi seluruh opsi paket yang bisa dibeli.
 *     responses:
 *       200:
 *         description: Berhasil mengambil data paket
 *       500:
 *         description: Terjadi kesalahan internal
 *   post:
 *     summary: Membuat paket langganan baru
 *     tags: [Langganan]
 *     description: |
 *       Menambah opsi paket langganan baru ke dalam sistem (Khusus Super Admin).
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Pengecekan Token Sesi (harus sudah login).
 *       2. Validasi Role ketat: **Hanya `super admin`** yang boleh mengakses fungsi ini.
 *       3. Mengekstrak nominal `harga` dan `durasi` dari JSON body request.
 *       4. Menyimpan paket langganan ke database dan merespon dengan data paket terbaru.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [harga, durasi]
 *             properties:
 *               harga: { type: integer, description: "Harga paket dalam Rupiah" }
 *               durasi: { type: integer, description: "Durasi paket dalam hari" }
 *     responses:
 *       201:
 *         description: Paket berhasil dibuat
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin (Hanya Super Admin)
 */

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('Langganan')
      .select('*')
      .order('harga', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mengambil daftar paket langganan.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!token || !session) {
      return NextResponse.json({ error: 'Sesi tidak valid atau Anda belum login.' }, { status: 401 });
    }

    if ((session as any).role !== 'super admin') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya Super Admin yang dapat membuat paket langganan.' }, { status: 403 });
    }

    const { harga, durasi } = await request.json();

    if (!harga || !durasi) {
      return NextResponse.json({ error: 'Harga dan Durasi wajib diisi.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('Langganan')
      .insert([{ harga, durasi }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data, message: 'Paket langganan berhasil dibuat.' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal membuat paket langganan.' }, { status: 500 });
  }
}
