import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySessionToken } from '@/lib/session';
import cloudinary from '@/lib/cloudinary';

/**
 * @swagger
 * /api/tenants/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *   get:
 *     summary: Melihat detail tenant
 *     tags: [Tenants]
 *     responses:
 *       200:
 *         description: Berhasil
 *   put:
 *     summary: Memperbarui data tenant (Mendukung upload gambar toko)
 *     security:
 *       - CookieAuth: []
 *     tags: [Tenants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *               address: { type: string }
 *               phone: { type: string }
 *               image_url: { type: string }
 *               is_active: { type: boolean }
 *               kode_tenant: { type: string }
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *               address: { type: string }
 *               phone: { type: string }
 *               is_active: { type: boolean }
 *               kode_tenant: { type: string }
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Foto toko baru (akan otomatis diupload ke Cloudinary)
 *     responses:
 *       200:
 *         description: Berhasil diperbarui
 *   delete:
 *     summary: Menghapus tenant
 *     security:
 *       - CookieAuth: []
 *     tags: [Tenants]
 *     responses:
 *       204:
 *         description: Berhasil dihapus
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 404 });

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Verifikasi Identitas dari HttpOnly Cookie
    const token = request.cookies.get('token')?.value;
    if (!token || !(await verifySessionToken(token))) {
      return NextResponse.json({ error: 'Tidak sah' }, { status: 401 });
    }

    const { id } = await params;
    
    const contentType = request.headers.get('content-type') || '';
    let updateFields: any = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      updateFields = {
        name: formData.get('name') as string || undefined,
        slug: formData.get('slug') as string || undefined,
        address: formData.get('address') as string || undefined,
        phone: formData.get('phone') as string || undefined,
        is_active: formData.get('is_active') === 'true' || undefined,
        kode_tenant: formData.get('kode_tenant') as string || undefined,
      };

      // Handle File Upload to Cloudinary
      const file = formData.get('file') as File;
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { 
              folder: 'sf-service/tenants', 
              format: 'webp',
              use_filename: true,
              unique_filename: true
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        });
        updateFields.image_url = (uploadResult as any).secure_url;
      }
    } else {
      updateFields = await request.json();

      // SMART DETECTION: Jika image_url adalah Base64, upload ke Cloudinary
      if (updateFields.image_url && updateFields.image_url.startsWith('data:image')) {
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(
            updateFields.image_url,
            { 
              folder: 'sf-service/tenants', 
              format: 'webp' 
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
        });
        updateFields.image_url = (uploadResult as any).secure_url;
      }
    }

    // Bersihkan field yang tidak ingin diupdate (jika undefined)
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

    const { data, error } = await supabaseAdmin
      .from('tenants')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data, message: 'Tenant diperbarui' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Verifikasi Identitas dari HttpOnly Cookie
    const token = request.cookies.get('token')?.value;
    if (!token || !(await verifySessionToken(token))) {
      return NextResponse.json({ error: 'Tidak sah' }, { status: 401 });
    }

    const { id } = await params;
    const { error } = await supabaseAdmin
      .from('tenants')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
