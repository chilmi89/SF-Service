import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

let mockProfile: any = null;
let mockActiveOrder: any = null;
let mockLayanan: any = null;
let mockOrder: any = null;
let mockTransaction: any = null;
let mockOrdersList: any[] = [];
let mockSession: any = null;
let mockRateLimitAllowed = true;

// 1. Mock Supabase
vi.mock('@/lib/supabaseAdmin', () => {
  const buildChain = (table: string) => {
    const builder: any = {
      select: vi.fn().mockImplementation(() => builder),
      eq: vi.fn().mockImplementation(() => builder),
      neq: vi.fn().mockImplementation(() => builder),
      not: vi.fn().mockImplementation(() => builder),
      order: vi.fn().mockImplementation(() => builder),
      limit: vi.fn().mockImplementation(() => builder),
      insert: vi.fn().mockImplementation(() => builder),
      delete: vi.fn().mockImplementation(() => builder),
      single: vi.fn().mockImplementation(() => {
        if (table === 'profiles') {
          return Promise.resolve({ data: mockProfile, error: null });
        }
        if (table === 'layanan') {
          return Promise.resolve({ data: mockLayanan, error: null });
        }
        if (table === 'orders') {
          return Promise.resolve({ data: mockOrder, error: null });
        }
        if (table === 'transactions') {
          return Promise.resolve({ data: mockTransaction, error: null });
        }
        if (table === 'tenants') {
          return Promise.resolve({ data: { id: 'tenant-123' }, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      }),
      maybeSingle: vi.fn().mockImplementation(() => {
        if (table === 'orders') {
          return Promise.resolve({ data: mockActiveOrder, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      }),
      then: vi.fn().mockImplementation((callback: any) => {
        return Promise.resolve(callback({ data: mockOrdersList, error: null }));
      })
    };
    return builder;
  };

  return {
    supabaseAdmin: {
      from: vi.fn().mockImplementation((table: string) => {
        return buildChain(table);
      })
    }
  };
});

// 2. Mock Session verifySessionToken
vi.mock('@/lib/session', () => ({
  verifySessionToken: vi.fn().mockImplementation(() => {
    return Promise.resolve(mockSession);
  }),
  createSessionToken: vi.fn().mockResolvedValue('dummy-token')
}));

// 3. Mock Rate Limiter
vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: vi.fn().mockImplementation(() => {
    return Promise.resolve({
      allowed: mockRateLimitAllowed,
      remainingMs: 5000
    });
  })
}));

describe('Orders API Endpoint (/api/orders)', () => {
  beforeEach(() => {
    mockSession = { userId: 'usr-123', role: 'customer' };
    mockProfile = { id: 'prof-123', full_name: 'Budi Test', phone: '0812345', address: 'Malang' };
    mockActiveOrder = null;
    mockLayanan = { id: 'lay-123', harga_dasar: 100000, tenant_id: 'tenant-123' };
    mockOrder = { id: 'ord-123', id_customer: 'prof-123', status: 2 };
    mockTransaction = { id: 'trans-123', invoice_number: 'INV-123', total_bayar: 100000 };
    mockOrdersList = [
      { id: 'ord-123', customer: { full_name: 'Budi Test' }, transactions: { invoice_number: 'INV-123' } }
    ];
    mockRateLimitAllowed = true;
  });

  describe('GET /api/orders', () => {
    it('harus mengembalikan daftar orders milik customer dengan status 200', async () => {
      const req = new NextRequest('http://localhost/api/orders', {
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toHaveLength(1);
    });

    it('harus mengembalikan 403 jika mengakses as=tenant tetapi bukan owner/admin', async () => {
      mockSession.role = 'customer';
      const req = new NextRequest('http://localhost/api/orders?as=tenant', {
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toBe('Akses ditolak');
    });
  });

  describe('POST /api/orders', () => {
    it('harus mengembalikan 401 jika user belum login', async () => {
      mockSession = null;
      const req = new NextRequest('http://localhost/api/orders', {
        method: 'POST',
        body: JSON.stringify({ layanan_id: 'lay-123' })
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toContain('Silakan login');
    });

    it('harus mengembalikan 403 jika profil user belum lengkap', async () => {
      mockProfile.phone = ''; // Phone kosong

      const req = new NextRequest('http://localhost/api/orders', {
        method: 'POST',
        body: JSON.stringify({ layanan_id: 'lay-123' }),
        headers: { 'cookie': 'token=validToken' }
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain('Profil Anda belum lengkap');
    });

    it('harus mengembalikan 403 jika user masih memiliki order aktif yang sedang berjalan', async () => {
      mockActiveOrder = { id: 'ord-active', status: 2 }; // Order aktif dengan status 2 (proses)

      const req = new NextRequest('http://localhost/api/orders', {
        method: 'POST',
        body: JSON.stringify({ layanan_id: 'lay-123' }),
        headers: { 'cookie': 'token=validToken' }
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain('pesanan yang sedang berjalan');
    });

    it('harus mengembalikan 201 jika order dan transaksi berhasil dibuat', async () => {
      const req = new NextRequest('http://localhost/api/orders', {
        method: 'POST',
        body: JSON.stringify({ layanan_id: 'lay-123', catatan: 'Tolong cepat ya' }),
        headers: { 'cookie': 'token=validToken' }
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.message).toBe('Pesanan berhasil dibuat');
      expect(body.data.order.id).toBe('ord-123');
      expect(body.data.transaction.invoice_number).toBe('INV-123');
    });
  });
});
