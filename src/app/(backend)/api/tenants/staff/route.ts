import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySessionToken } from '@/lib/session';

/**
 * @swagger
 * /api/tenants/staff:
 *   get:
 *     summary: Mendapatkan daftar staf di tenant (Admin & Teknisi)
 *     tags: [Tenants Staff]
 *     description: |
 *       Melihat daftar seluruh karyawan / staf yang dipekerjakan dalam sebuah tenant.
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Pengecekan sesi Token.
 *       2. Mengidentifikasi Role yang memanggil API. Super Admin bisa melihat semua lewat filter, sedangkan Pemilik / Staf hanya dibatasi pada tenant-nya sendiri.
 *       3. Mengambil daftar akun dari tabel `profiles` (yang memiliki `kode_tenant` yang sama) dengan pengecualian *sembunyikan diri sendiri*.
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar staf
 *   post:
 *     summary: Menambahkan staf baru (Admin Tenant atau Teknisi) ke tenant
 *     tags: [Tenants Staff]
 *     description: |
 *       Merekrut dan mendaftarkan staf baru berdasarkan email yang sudah terdaftar di platform.
 *       
 *       **Alur Kerja (Workflow):**
 *       1. Memastikan akun yang request ber-role Owner / Super Admin.
 *       2. (Opsional/Disarankan) Mengecek status langganan aktif tenant sebelum bisa menambah staf.
 *       3. Mencari `auth_users.id` berdasarkan input email. Jika email tidak ditemukan, proses ditolak.
 *       4. Memastikan user tujuan (calon staf) belum tergabung ke tenant manapun.
 *       5. Update `profiles` calon staf: Menyematkan `kode_tenant` milik bos-nya, dan meng-*upgrade* role mereka (menjadi `admin tenant` atau `teknisi`).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, role_name]
 *             properties:
 *               email: { type: string, description: "Email user yang akan didaftarkan" }
 *               role_name: { type: string, enum: ["admin tenant", "teknisi"], description: "Role yang diberikan" }
 *     responses:
 *       201:
 *         description: Staf berhasil ditambahkan
 *       400:
 *         description: User sudah memiliki tenant atau data tidak valid
 *       403:
 *         description: Tidak memiliki izin (Hanya Owner/Super Admin)
 *       404:
 *         description: User tidak ditemukan
 */

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!token || !session) {
      return NextResponse.json({ error: 'Tidak sah' }, { status: 401 });
    }

    const userId = (session as any).userId;
    const userRole = (session as any).role;
    const { searchParams } = new URL(request.url);
    const filterTenant = searchParams.get('kode_tenant');

    let targetKodeTenant: string | null = null;

    // 1. Logika Penentuan Target Tenant
    if (userRole === 'super admin' && filterTenant) {
      // Super Admin bisa melihat tenant mana saja lewat query param
      targetKodeTenant = filterTenant;
    } else {
      // Selain Super Admin (Owner/Staf), hanya boleh melihat tenant miliknya sendiri
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('kode_tenant')
        .eq('user_id', userId)
        .single();
      
      targetKodeTenant = profile?.kode_tenant || null;
    }

    if (!targetKodeTenant) {
      return NextResponse.json({ error: 'Data tenant tidak ditemukan untuk akun Anda.' }, { status: 403 });
    }

    // 2. Eksekusi Query dengan Filter Ketat
    const { data: staff, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone, address, avatar_url, kode_tenant, roles(name), auth_users(email)')
      .eq('kode_tenant', targetKodeTenant)
      .neq('user_id', userId) // Sembunyikan diri sendiri dari daftar staf
      .order('full_name', { ascending: true });

    if (error) throw error;

    // Bersihkan data sebelum dikirim
    const cleanStaff = staff.map((s: any) => ({
      id: s.id,
      full_name: s.full_name,
      email: s.auth_users?.email,
      role: s.roles?.name,
      phone: s.phone,
      kode_tenant: s.kode_tenant
    }));

    return NextResponse.json({ data: cleanStaff }, { status: 200 });
  } catch (error: any) {
    console.error('Get Staff Error:', error);
    return NextResponse.json({ error: 'Gagal mengambil daftar staf.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!token || !session) {
      return NextResponse.json({ error: 'Sesi tidak valid.' }, { status: 401 });
    }

    const ownerId = (session as any).userId;
    const ownerRole = (session as any).role;

    // 1. Validasi Izin (Hanya Owner atau Super Admin)
    if (ownerRole !== 'owner tunggal' && ownerRole !== 'owner' && ownerRole !== 'super admin') {
      return NextResponse.json({ error: 'Hanya Pemilik Tenant yang dapat menambah staf.' }, { status: 403 });
    }

    const { email, role_name } = await request.json();

    if (!email || !role_name) {
      return NextResponse.json({ error: 'Email dan Role Name wajib diisi.' }, { status: 400 });
    }

    if (role_name !== 'admin tenant' && role_name !== 'teknisi') {
      return NextResponse.json({ error: 'Role hanya boleh "admin tenant" atau "teknisi".' }, { status: 400 });
    }

    // 2. Ambil Kode Tenant si Owner
    const { data: ownerProfile } = await supabaseAdmin
      .from('profiles')
      .select('kode_tenant')
      .eq('user_id', ownerId)
      .single();

    if (!ownerProfile?.kode_tenant) {
      return NextResponse.json({ error: 'Anda belum terdaftar sebagai pemilik tenant.' }, { status: 403 });
    }

    // 3. Cek Langganan Aktif (Opsional tapi disarankan)
    const { data: subscription } = await supabaseAdmin
      .from('Langganan_tenant')
      .select('id')
      .eq('kode_tenant', ownerProfile.kode_tenant) // Ini butuh lookup ID jika kode_tenant di tabel itu adalah int8
      .maybeSingle();

    // Jika di tabel Langganan_tenant kode_tenant adalah ID (int8), kita cari ID tenantnya dulu
    let tenantId = ownerProfile.kode_tenant;
    const { data: tenantRef } = await supabaseAdmin.from('tenants').select('id').eq('kode_tenant', ownerProfile.kode_tenant).single();
    if (tenantRef) {
      const { data: subCheck } = await supabaseAdmin.from('Langganan_tenant').select('id').eq('kode_tenant', tenantRef.id).maybeSingle();
      if (!subCheck) {
        return NextResponse.json({ error: 'Tenant Anda belum berlangganan. Silakan berlangganan terlebih dahulu untuk menambah staf.' }, { status: 403 });
      }
    }

    // 4. Cari User Target berdasarkan Email
    const { data: targetUser, error: userError } = await supabaseAdmin
      .from('auth_users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (!targetUser) {
      return NextResponse.json({ error: 'Pengguna dengan email tersebut tidak ditemukan. Pastikan email sudah terdaftar di aplikasi.' }, { status: 404 });
    }

    // Cek jika target adalah diri sendiri (Owner)
    if (targetUser.id === ownerId) {
      return NextResponse.json({ error: 'Anda tidak dapat mendaftarkan diri Anda sendiri sebagai staf. Akun owner secara otomatis memiliki akses penuh.' }, { status: 400 });
    }

    // 5. Cek Profile Target
    const { data: targetProfile } = await supabaseAdmin
      .from('profiles')
      .select('kode_tenant, id')
      .eq('user_id', targetUser.id)
      .single();

    if (targetProfile?.kode_tenant) {
      return NextResponse.json({ error: 'Pengguna tersebut sudah terdaftar di sebuah tenant. Tidak bisa didaftarkan dua kali.' }, { status: 400 });
    }

    // 6. Ambil UUID Role
    const { data: roleData } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', role_name)
      .single();

    if (!roleData) {
      return NextResponse.json({ error: 'Role tidak valid di sistem.' }, { status: 500 });
    }

    // 7. Update Profile Target
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        kode_tenant: ownerProfile.kode_tenant,
        role_id: roleData.id
      })
      .eq('user_id', targetUser.id);

    if (updateError) throw updateError;

    return NextResponse.json({ message: `Berhasil menambahkan staf sebagai ${role_name}.` }, { status: 201 });
  } catch (error: any) {
    console.error('Add Staff Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat menambahkan staf.' }, { status: 500 });
  }
}
