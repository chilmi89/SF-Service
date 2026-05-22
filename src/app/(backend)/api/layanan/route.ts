import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySessionToken } from '@/lib/session';
import cloudinary from '@/lib/cloudinary';

/**
 * @swagger
 * /api/layanan:
 *   get:
 *     summary: Mengambil daftar layanan
 *     tags: [Layanan (User)]
 *     parameters:
 *       - in: query
 *         name: id_kategori
 *         schema:
 *           type: integer
 *         description: Filter layanan berdasarkan ID Kategori (opsional)
 *     responses:
 *       200:
 *         description: Berhasil
 *   post:
 *     summary: Menambah layanan baru (Khusus Tenant)
 *     tags: [Layanan (Tenant)]
 *     description: Endpoint ini otomatis mendeteksi tenant_id dari sesi login pengguna, sehingga tidak perlu lagi dikirim secara manual.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nama_layanan, harga_dasar, id_kategori]
 *             properties:
 *               nama_layanan: { type: string }
 *               harga_dasar: { type: number }
 *               id_kategori: { type: number, description: "ID Kategori Layanan" }
 *               gambar: { type: string, nullable: true }
 *               descripsi: { type: string, nullable: true }
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [nama_layanan, harga_dasar, id_kategori]
 *             properties:
 *               nama_layanan: { type: string }
 *               harga_dasar: { type: number }
 *               id_kategori: { type: number, description: "ID Kategori Layanan" }
 *               gambar:
 *                 type: string
 *                 format: binary
 *                 description: Foto layanan untuk diupload (Cloudinary)
 *               descripsi: { type: string }
 *     responses:
 *       201:
 *         description: Layanan dibuat
 *       401:
 *         description: Sesi tidak sah
 *       403:
 *         description: Akses ditolak karena user bukan tenant
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_kategori = searchParams.get('id_kategori');

    let query = supabaseAdmin
      .from('layanan')
      .select('*, tenants(name)');

    if (id_kategori) {
      query = query.eq('id_kategori', parseInt(id_kategori));
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verifikasi Identitas dari HttpOnly Cookie
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifySessionToken(token) : null;
    
    if (!token || !session) {
      return NextResponse.json({ error: 'Tidak sah' }, { status: 401 });
    }

    // Pengecekan Role (Hanya Owner & Owner Tunggal)
    const allowedRoles = ['owner', 'owner tunggal', 'owner_tunggal'];
    const userRole = (session.role || '').toLowerCase();
    
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Akses ditolak: Hanya Owner yang dapat menambah layanan' }, { status: 403 });
    }

    const tenant_id = session.tenantId;

    if (!tenant_id) {
      return NextResponse.json({ error: 'Akses ditolak: User bukan bagian dari tenant manapun' }, { status: 403 });
    }

    const contentType = request.headers.get('content-type') || '';
    let nama_layanan: any, harga_dasar: any, id_kategori: any, gambar: any, descripsi: any;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      nama_layanan = formData.get('nama_layanan') as string;
      harga_dasar = parseFloat(formData.get('harga_dasar') as string);
      id_kategori = parseInt(formData.get('id_kategori') as string);
      descripsi = formData.get('descripsi') as string;
      
      const file = formData.get('gambar') as File;
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream({ folder: 'sf-service/layanan', format: 'webp' }, (error, result) => {
            if (error) reject(error); else resolve(result);
          }).end(buffer);
        });
        gambar = (uploadResult as any).secure_url;
      }
    } else {
      const body = await request.json();
      nama_layanan = body.nama_layanan;
      harga_dasar = body.harga_dasar;
      id_kategori = parseInt(body.id_kategori);
      descripsi = body.descripsi;
      gambar = body.gambar;

      if (gambar && gambar.startsWith('data:image')) {
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(gambar, { folder: 'sf-service/layanan', format: 'webp' }, (error, result) => {
            if (error) reject(error); else resolve(result);
          });
        });
        gambar = (uploadResult as any).secure_url;
      }
    }

    if (!nama_layanan || isNaN(harga_dasar) || !id_kategori || isNaN(id_kategori)) {
      return NextResponse.json({ error: 'Nama Layanan, Harga Dasar, dan Kategori wajib diisi' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('layanan')
      .insert([{ tenant_id, nama_layanan, harga_dasar, id_kategori, gambar, descripsi }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data, message: 'Layanan berhasil ditambahkan' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
