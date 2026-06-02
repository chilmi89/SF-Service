import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySessionToken } from '@/lib/session';

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Mengambil daftar pesanan
 *     tags: [Orders]
 *     description: |
 *       Mendapatkan daftar pesanan (order) berdasarkan role user yang login.
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Memverifikasi Session Token.
 *       2. Mengambil profil user yang login.
 *       3. Jika query parameter `as=tenant`, sistem mengecek hak akses Owner/Admin.
 *       4. Query database akan menyesuaikan: Customer melihat pesanan pribadinya, sedangkan Owner melihat seluruh pesanan masuk ke tenant-nya.
 *       5. Menggabungkan data pesanan dengan relasi tabel `layanan` dan `transactions`.
 *     parameters:
 *       - in: query
 *         name: as
 *         schema:
 *           type: string
 *         description: Isi dengan `tenant` jika ingin melihat pesanan masuk sebagai Owner/Tenant
 *     responses:
 *       200:
 *         description: Berhasil mengambil data
 *   post:
 *     summary: Membuat pesanan baru
 *     tags: [Orders]
 *     description: |
 *       Membuat pesanan baru. Sistem akan otomatis membuat `transaction` dan menghubungkannya dengan `order`.
 *       User harus login agar pesanannya terhubung dengan akunnya.
 *
 *       **Aturan Pesanan Aktif:**
 *       Seorang pengguna hanya boleh memiliki **1 pesanan aktif** pada satu waktu.
 *       Pesanan dianggap selesai/tidak aktif jika statusnya:
 *       - **`ditolak` (ID: 6)** → Pesanan dibatalkan oleh admin
 *       - **`pembayaran selesai` (ID: 8)** → Pesanan tuntas & lunas
 *
 *       Jika masih ada order dengan status selain itu (proses, perjalanan, menunggu pembayaran, dll),
 *       pengguna **tidak dapat** membuat order baru.
 *
 *       **Alur Kerja (Workflow):**
 *       1. Memverifikasi Session Token untuk memastikan user login.
 *       2. Memeriksa kelengkapan profil customer (Nama, HP, Alamat).
 *       3. **Cek Order Aktif**: Query database mencari order customer yang statusnya bukan `ditolak (6)` dan bukan `pembayaran selesai (8)`. Jika ditemukan, request ditolak dengan pesan informatif.
 *       4. Mendapatkan detail layanan yang dipesan (harga dasar dan tenant_id).
 *       5. Membuat record pesanan baru (`orders`) dengan status awal `proses (2)`.
 *       6. Secara otomatis men-generate nomor invoice unik dan membuat record tagihan (`transactions`).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [layanan_id]
 *             properties:
 *               layanan_id: { type: string, description: "ID layanan yang dipesan" }
 *               catatan: { type: string, description: "Catatan tambahan untuk pesanan" }
 *               tanggal: { type: string, format: date, description: "Tanggal booking pesanan (contoh: 2024-05-23)" }
 *               jam: { type: string, format: time, description: "Jam booking pesanan (contoh: 14:30)" }
 *     responses:
 *       201:
 *         description: Pesanan berhasil dibuat
 *       400:
 *         description: ID Layanan tidak diisi
 *       403:
 *         description: Profil belum lengkap atau masih ada order aktif yang berjalan
 *       404:
 *         description: Layanan tidak ditemukan
 * */

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

    const asMode = request.nextUrl.searchParams.get('as');

    let query;

    if (asMode === 'tenant') {
      if (!['owner', 'owner tunggal', 'owner_tunggal', 'admin tenant'].includes(role)) {
         return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
      }

      const { data: targetTenant } = await supabaseAdmin.from('tenants').select('id').eq('kode_tenant', profile.kode_tenant).single();
      
      // Pakai !inner agar bisa difilter berdasarkan kolom di dalam transactions
      query = supabaseAdmin
        .from('orders')
        .select(`
          *,
          layanan (nama_layanan, harga_dasar, tenant_id),
          transactions!inner (invoice_number, total_bayar, status_pembayaran, tenant_id)
        `)
        .order('tanggal_order', { ascending: false });

      if (targetTenant) {
        query = query.eq('transactions.tenant_id', targetTenant.id);
      }
    } else {
      // Default: Sebagai Customer Biasa (Lihat pesanan sendiri)
      query = supabaseAdmin
        .from('orders')
        .select(`
          *,
          layanan (nama_layanan, harga_dasar, tenant_id),
          transactions (invoice_number, total_bayar, status_pembayaran)
        `)
        .order('tanggal_order', { ascending: false })
        .eq('id_customer', profile.id);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Rapikan data karena filter not() bisa menyisakan struktur aneh jika relasi gagal
    const validData = data?.filter(d => d.transactions !== null) || [];

    return NextResponse.json({ data: validData }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifySessionToken(token) : null;
    
    if (!session) {
      return NextResponse.json({ error: 'Silakan login terlebih dahulu untuk membuat pesanan' }, { status: 401 });
    }

    const userId = (session as any).userId;

    // Dapatkan profil pemesan
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone, address')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 });
    }

    // Validasi kelengkapan profil (Nama Lengkap, Nomor HP, Alamat)
    if (!profile.full_name || !profile.phone || !profile.address) {
      return NextResponse.json({ 
        error: 'Profil Anda belum lengkap. Silakan lengkapi Nama Lengkap, Nomor HP, dan Alamat di pengaturan profil sebelum membuat pesanan.' 
      }, { status: 403 });
    }

    // =============================================
    // CEK ORDER AKTIF (1 order aktif per pengguna)
    // Status yang dianggap SELESAI/TIDAK AKTIF:
    //   ID 6 = ditolak (dibatalkan admin)
    //   ID 8 = pembayaran selesai
    // Jika ada order selain status itu → blokir
    // =============================================
    const SELESAI_STATUS_IDS = [6, 8];
    const { data: activeOrder } = await supabaseAdmin
      .from('orders')
      .select('id, status')
      .eq('id_customer', profile.id)
      .not('status', 'in', `(${SELESAI_STATUS_IDS.join(',')})`)
      .limit(1)
      .maybeSingle();

    if (activeOrder) {
      return NextResponse.json({ 
        error: 'Anda masih memiliki pesanan yang sedang berjalan. Pesanan baru hanya dapat dibuat setelah pesanan aktif selesai (pembayaran lunas atau dibatalkan oleh admin).' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { layanan_id, catatan, tanggal, jam } = body;

    if (!layanan_id) {
      return NextResponse.json({ error: 'ID Layanan wajib diisi' }, { status: 400 });
    }

    // 1. Dapatkan detail layanan
    const { data: layanan, error: layananError } = await supabaseAdmin
      .from('layanan')
      .select('id, harga_dasar, tenant_id')
      .eq('id', layanan_id)
      .single();

    if (layananError || !layanan) {
      return NextResponse.json({ error: 'Layanan tidak ditemukan' }, { status: 404 });
    }

    // 2. Buat Order (Terlebih dahulu agar bisa di-link ke transaction)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([{
        layanan_id: layanan.id,
        id_customer: profile.id,
        status: 2, // ID 2 = "proses" di tabel status
        catatan: catatan || '',
        tanggal_order: tanggal || null,
        jam: jam || null
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // 3. Buat Transaksi
    const invoiceNumber = `INV-${Date.now()}`;
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .insert([{
        tenant_id: layanan.tenant_id,
        id_order: order.id, // Di-link ke order yang baru dibuat
        invoice_number: invoiceNumber,
        total_bayar: layanan.harga_dasar,
        status_pembayaran: 1 // Asumsi ID 1 adalah "Belum Lunas" di tabel status
      }])
      .select()
      .single();

    if (transactionError) {
      // Rollback order jika transaksi gagal
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      throw transactionError;
    }

    return NextResponse.json({ 
      message: 'Pesanan berhasil dibuat', 
      data: { order, transaction } 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
