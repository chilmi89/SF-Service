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
 *       - Jika login sebagai **User Biasa**: Hanya melihat pesanannya sendiri.
 *       - Jika login sebagai **Owner**: Melihat semua pesanan di tenant miliknya.
 *     responses:
 *       200:
 *         description: Berhasil mengambil data
 *   post:
 *     summary: Membuat pesanan baru
 *     tags: [Orders]
 *     description: |
 *       Membuat pesanan baru. Sistem akan otomatis membuat `transaction` dan menghubungkannya dengan `order`.
 *       User harus login agar pesanannya terhubung dengan akunnya.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [layanan_id]
 *             properties:
 *               layanan_id: { type: string, description: "ID layanan yang dipesan" }
 *               customer_name: { type: string, description: "Nama pelanggan (opsional, default ambil dari profil)" }
 *               catatan: { type: string, description: "Catatan tambahan untuk pesanan" }
 *               tanggal: { type: string, format: date, description: "Tanggal booking pesanan (contoh: 2024-05-23)" }
 *               jam: { type: string, format: time, description: "Jam booking pesanan (contoh: 14:30)" }
 *     responses:
 *       201:
 *         description: Pesanan berhasil dibuat
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
      .from('orders')
      .select(`
        *,
        layanan (nama_layanan, harga_dasar, tenant_id),
        transactions (invoice_number, total_bayar, status_pembayaran)
      `)
      .order('created_at', { ascending: false });

    if (['owner', 'owner tunggal', 'owner_tunggal', 'admin tenant'].includes(role)) {
      // Jika Owner, ambil semua order di tenant-nya
      // Kita perlu filter berdasarkan tenant_id dari tabel layanan atau transactions
      // Supabase tidak mendukung filter top-level untuk relasi dengan mudah jika tak ada tenant_id di orders
      // Sebagai workaround, kita ambil tenant_id yang sesuai dari tabel profiles (harus resolve layanan.tenant_id)
      
      const { data: targetTenant } = await supabaseAdmin.from('tenants').select('id').eq('kode_tenant', profile.kode_tenant).single();
      
      if(targetTenant) {
        // Filter via transactions
        query = query.eq('transactions.tenant_id', targetTenant.id).not('transactions', 'is', null);
      }
    } else {
      // Jika User Biasa, ambil order miliknya saja
      query = query.eq('customer_id', profile.id);
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
      .select('id, full_name')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 });
    }

    const body = await request.json();
    const { layanan_id, catatan, customer_name, tanggal, jam } = body;

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

    // 2. Buat Transaksi
    const invoiceNumber = `INV-${Date.now()}`;
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .insert([{
        tenant_id: layanan.tenant_id,
        invoice_number: invoiceNumber,
        total_bayar: layanan.harga_dasar,
        status_pembayaran: 'Belum Lunas'
      }])
      .select()
      .single();

    if (transactionError) throw transactionError;

    // 3. Buat Order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([{
        transaction_id: transaction.id,
        layanan_id: layanan.id,
        customer_id: profile.id,
        customer_name: customer_name || profile.full_name,
        status_order: 'Menunggu Konfirmasi',
        catatan: catatan || '',
        tanggal_order: tanggal || null,
        jam: jam || null
      }])
      .select()
      .single();

    if (orderError) {
      // Rollback transaction jika order gagal (manual)
      await supabaseAdmin.from('transactions').delete().eq('id', transaction.id);
      throw orderError;
    }

    return NextResponse.json({ 
      message: 'Pesanan berhasil dibuat', 
      data: { order, transaction } 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
