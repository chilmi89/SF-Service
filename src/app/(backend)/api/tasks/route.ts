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
 *       Menampilkan daftar tugas dengan filter sesuai role pengguna.
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Verifikasi sesi token otentikasi dari cookie.
 *       2. Mengevaluasi Role pengguna: 
 *          - **Customer**: Hanya melihat task yang terkait dengan pesanannya.
 *          - **Teknisi**: Melihat task yang secara eksplisit di-assign kepadanya.
 *          - **Owner/Admin**: Melihat semua riwayat task yang ada di dalam tenant miliknya.
 *       3. Menjalankan query ke tabel `tasks` dengan relasi `orders` dan `profiles`.
 *     responses:
 *       200:
 *         description: Berhasil mengambil data
 *   post:
 *     summary: Membuat tugas baru (Untuk Owner)
 *     tags: [Tasks]
 *     description: |
 *       Mendelegasikan sebuah pesanan menjadi tugas kepada teknisi atau untuk dikerjakan sendiri
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Memverifikasi Otorisasi (Hanya boleh dipanggil oleh Owner/Admin).
 *       2. Otomatis menentukan teknisi jika ID dikosongkan (Owner tunggal otomatis menunjuk dirinya sendiri, sedangkan Admin akan diblokir dan wajib menunjuk teknisi).
 *       3. Menetapkan otomatis deadline (default 1 hari dari waktu sekarang jika tidak ada input spesifik).
 *       4. Membuat baris baru di tabel `tasks` yang berelasi erat dengan `order_id` asal.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order_id, deskripsi]
 *             properties:
 *               order_id: { type: string, description: "ID pesanan (order) yang terkait" }
 *               technician_id: { type: string, description: "ID Profil Teknisi yang ditugaskan (opsional, bisa dirinya sendiri)" }
 *               deskripsi: { type: string, description: "Deskripsi tugas yang harus dikerjakan" }
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
        orders!inner (id_customer, customer:profiles!id_customer(full_name, phone), layanan(tenant_id)),
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
      query = query.eq('orders.id_customer', profile.id);
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
    const { order_id, technician_id, deskripsi, status_tugas } = body;
    let { deadline } = body;

    if (!order_id || !deskripsi) {
      return NextResponse.json({ error: 'Order ID dan Deskripsi Tugas wajib diisi' }, { status: 400 });
    }

    // Jika deadline tidak diisi, otomatis 1 hari dari sekarang
    if (!deadline) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      deadline = tomorrow.toISOString();
    }

    let assignedTechnician = technician_id;
    if (!assignedTechnician) {
      if (['owner', 'owner tunggal', 'owner_tunggal'].includes(role)) {
        const { data: profile } = await supabaseAdmin.from('profiles').select('id').eq('user_id', userId).single();
        assignedTechnician = profile?.id;
      } else {
        return NextResponse.json({ error: 'Admin wajib menunjuk teknisi untuk tugas ini' }, { status: 400 });
      }
    }

    const finalStatus = (status_tugas && status_tugas !== 'Pending') ? status_tugas : 2;

    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .insert([{
        order_id,
        technician_id: assignedTechnician,
        deskripsi,
        status_tugas: finalStatus,
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
