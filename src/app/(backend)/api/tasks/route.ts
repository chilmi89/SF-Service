import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySessionToken } from '@/lib/session';

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Mengambil daftar tugas (Task)
 *     tags: [Tasks]
 *     description: |
 *       - **User Biasa**: Melihat task yang terkait dengan pesanan (order) miliknya.
 *       - **Teknisi**: Melihat daftar task yang ditugaskan kepada dirinya.
 *       - **Owner**: Melihat semua task di tenant miliknya.
 *     responses:
 *       200:
 *         description: Berhasil mengambil data
 *   post:
 *     summary: Membuat tugas baru (Untuk Owner)
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order_id, nama_tugas]
 *             properties:
 *               order_id: { type: string, description: "ID pesanan (order) yang terkait" }
 *               technician_id: { type: string, description: "ID Profil Teknisi yang ditugaskan (opsional, bisa dirinya sendiri)" }
 *               nama_tugas: { type: string }
 *               deskripsi: { type: string }
 *               deadline: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Tugas berhasil dibuat
 */

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: 'Tidak sah' }, { status: 401 });
    }

    const userId = (session as any).userId;
    const role = (session as any).role?.toLowerCase();

    // Dapatkan data profil user yang login
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, kode_tenant')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 });
    }

    let query = supabaseAdmin
      .from('tasks')
      .select(`
        *,
        orders!inner (customer_id, customer_name, layanan(tenant_id)),
        technician:profiles!technician_id (full_name)
      `)
      .order('deadline', { ascending: true });

    if (['owner', 'owner tunggal', 'owner_tunggal', 'admin tenant'].includes(role)) {
      // Owner melihat semua task di tenant miliknya
      const { data: targetTenant } = await supabaseAdmin.from('tenants').select('id').eq('kode_tenant', profile.kode_tenant).single();
      if(targetTenant) {
        query = query.eq('orders.layanan.tenant_id', targetTenant.id);
      }
    } else if (role === 'teknisi') {
      // Teknisi melihat task yang di-assign kepadanya
      query = query.eq('technician_id', profile.id);
    } else {
      // User Biasa melihat task terkait pesanan miliknya
      query = query.eq('orders.customer_id', profile.id);
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
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifySessionToken(token) : null;
    
    if (!session) {
      return NextResponse.json({ error: 'Tidak sah' }, { status: 401 });
    }

    const userId = (session as any).userId;
    const role = (session as any).role?.toLowerCase();
    
    // Hanya owner/admin yang boleh assign task
    if (!['owner', 'owner tunggal', 'owner_tunggal', 'admin tenant'].includes(role)) {
      return NextResponse.json({ error: 'Hanya Owner atau Admin yang dapat membuat penugasan' }, { status: 403 });
    }

    const body = await request.json();
    const { order_id, technician_id, nama_tugas, deskripsi, deadline } = body;

    if (!order_id || !nama_tugas) {
      return NextResponse.json({ error: 'Order ID dan Nama Tugas wajib diisi' }, { status: 400 });
    }

    // Jika technician_id tidak diisi, otomatis assign ke dirinya sendiri
    let assignedTechnician = technician_id;
    if (!assignedTechnician) {
      const { data: profile } = await supabaseAdmin.from('profiles').select('id').eq('user_id', userId).single();
      assignedTechnician = profile?.id;
    }

    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .insert([{
        order_id,
        technician_id: assignedTechnician,
        nama_tugas,
        deskripsi: deskripsi || '',
        status_tugas: 'Pending', // Default status
        deadline: deadline || null
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: 'Tugas berhasil dibuat', data: task }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
