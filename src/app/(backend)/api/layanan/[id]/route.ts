import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySessionToken } from '@/lib/session';
import cloudinary from '@/lib/cloudinary';

/**
 * @swagger
 * /api/layanan/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *   get:
 *     summary: Melihat detail layanan
 *     tags: [Layanan (User)]
 *     responses:
 *       200:
 *         description: Berhasil
 *   put:
 *     summary: Memperbarui data layanan (Khusus Tenant)
 *     tags: [Layanan (Tenant)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama_layanan: { type: string }
 *               harga_dasar: { type: number }
 *               gambar: { type: string, nullable: true }
 *               descripsi: { type: string, nullable: true }
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nama_layanan: { type: string }
 *               harga_dasar: { type: number }
 *               gambar:
 *                 type: string
 *                 format: binary
 *                 description: Foto layanan untuk diupload (Cloudinary)
 *               descripsi: { type: string }
 *     responses:
 *       200:
 *         description: Berhasil diperbarui
 *   delete:
 *     summary: Menghapus layanan (Khusus Tenant)
 *     tags: [Layanan (Tenant)]
 *     responses:
 *       204:
 *         description: Berhasil dihapus
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from('layanan')
      .select('*, tenants(name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Layanan tidak ditemukan' }, { status: 404 });

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
      return NextResponse.json({ error: 'Akses ditolak: Hanya Owner yang dapat mengubah layanan' }, { status: 403 });
    }

    const tenant_id = session.tenantId;
    if (!tenant_id) {
      return NextResponse.json({ error: 'Akses ditolak: User bukan bagian dari tenant manapun' }, { status: 403 });
    }

    const { id } = await params;
    const contentType = request.headers.get('content-type') || '';
    let updateFields: any = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      updateFields = {
        nama_layanan: formData.get('nama_layanan') as string || undefined,
        harga_dasar: formData.get('harga_dasar') ? parseFloat(formData.get('harga_dasar') as string) : undefined,
        descripsi: formData.get('descripsi') as string || undefined,
      };

      const file = formData.get('gambar') as File;
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream({ folder: 'sf-service/layanan', format: 'webp' }, (error, result) => {
            if (error) reject(error); else resolve(result);
          }).end(buffer);
        });
        updateFields.gambar = (uploadResult as any).secure_url;
      }
    } else {
      const body = await request.json();
      updateFields = {
        nama_layanan: body.nama_layanan || undefined,
        harga_dasar: body.harga_dasar || undefined,
        descripsi: body.descripsi || undefined,
        gambar: body.gambar || undefined,
      };

      if (updateFields.gambar && updateFields.gambar.startsWith('data:image')) {
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(updateFields.gambar, { folder: 'sf-service/layanan', format: 'webp' }, (error, result) => {
            if (error) reject(error); else resolve(result);
          });
        });
        updateFields.gambar = (uploadResult as any).secure_url;
      }
    }

    // Bersihkan fields yang undefined
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

    const { data, error } = await supabaseAdmin
      .from('layanan')
      .update(updateFields)
      .eq('id', id)
      .eq('tenant_id', tenant_id) // Pastikan milik tenant tersebut
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data, message: 'Layanan diperbarui' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      return NextResponse.json({ error: 'Akses ditolak: Hanya Owner yang dapat menghapus layanan' }, { status: 403 });
    }

    const tenant_id = session.tenantId;
    if (!tenant_id) {
      return NextResponse.json({ error: 'Akses ditolak: User bukan bagian dari tenant manapun' }, { status: 403 });
    }

    const { id } = await params;
    const { error } = await supabaseAdmin
      .from('layanan')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenant_id); // Pastikan milik tenant tersebut

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
