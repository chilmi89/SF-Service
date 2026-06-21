import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT } from './route';
import { NextRequest } from 'next/server';

let mockProfile: any = null;
let mockOrder: any = null;
let mockTenant: any = null;
let mockSession: any = null;

// 1. Mock Supabase
vi.mock('@/lib/supabaseAdmin', () => {
  return {
    supabaseAdmin: {
      from: vi.fn().mockImplementation((table: string) => {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockImplementation(() => {
            if (table === 'profiles') {
              return { data: mockProfile, error: null };
            }
            if (table === 'orders') {
              return { data: mockOrder, error: null };
            }
            if (table === 'tenants') {
              return { data: mockTenant, error: null };
            }
            return { data: null, error: null };
          }),
          update: vi.fn().mockImplementation((payload: any) => {
            return {
              eq: vi.fn().mockReturnThis(),
              select: vi.fn().mockReturnThis(),
              single: vi.fn().mockImplementation(() => {
                if (table === 'orders') {
                  return { data: { ...mockOrder, ...payload }, error: null };
                }
                return { data: null, error: null };
              }),
              then: vi.fn().mockImplementation((callback: any) => {
                return callback({ data: null, error: null });
              })
            };
          })
        };
      })
    }
  };
});

// 2. Mock Session verifySessionToken
vi.mock('@/lib/session', () => ({
  verifySessionToken: vi.fn().mockImplementation(() => {
    return Promise.resolve(mockSession);
  })
}));

// 3. Mock Cloudinary
vi.mock('@/lib/cloudinary', () => ({
  default: {
    uploader: {
      upload: vi.fn().mockImplementation((image, options, callback) => {
        if (callback) {
          callback(null, { secure_url: 'https://cloudinary.com/payment_proof.webp' });
        }
        return Promise.resolve({ secure_url: 'https://cloudinary.com/payment_proof.webp' });
      }),
      upload_stream: vi.fn().mockImplementation((options, callback) => {
        callback(null, { secure_url: 'https://cloudinary.com/payment_proof.webp' });
        return { end: vi.fn() };
      })
    }
  }
}));

describe('Orders Detail API Endpoint (/api/orders/[id])', () => {
  beforeEach(() => {
    mockSession = { userId: 'usr-123', role: 'customer' };
    mockProfile = { id: 'prof-123', kode_tenant: 'TEN-123' };
    mockOrder = {
      id: 'ord-123',
      id_customer: 'prof-123',
      status: 2,
      layanan: { tenant_id: 'tenant-123' }
    };
    mockTenant = { id: 'tenant-123' };
  });

  describe('GET /api/orders/[id]', () => {
    it('harus mengembalikan status 401 jika user belum login', async () => {
      mockSession = null;
      const req = new NextRequest('http://localhost/api/orders/ord-123');
      const response = await GET(req, { params: Promise.resolve({ id: 'ord-123' }) });
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe('Tidak sah');
    });

    it('harus mengembalikan status 200 jika customer mengambil order-nya sendiri', async () => {
      const req = new NextRequest('http://localhost/api/orders/ord-123', {
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await GET(req, { params: Promise.resolve({ id: 'ord-123' }) });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.id).toBe('ord-123');
    });

    it('harus mengembalikan 403 jika customer lain mencoba melihat pesanan ini', async () => {
      mockOrder.id_customer = 'prof-different-customer';
      const req = new NextRequest('http://localhost/api/orders/ord-123', {
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await GET(req, { params: Promise.resolve({ id: 'ord-123' }) });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain('Akses ditolak');
    });
  });

  describe('PUT /api/orders/[id]', () => {
    it('harus mengembalikan 403 jika customer biasa mencoba merubah status order langsung', async () => {
      const req = new NextRequest('http://localhost/api/orders/ord-123', {
        method: 'PUT',
        body: JSON.stringify({ status: 3 }), // status 3 (perjalanan)
        headers: { 'cookie': 'token=validToken' }
      });

      const response = await PUT(req, { params: Promise.resolve({ id: 'ord-123' }) });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain('Hanya Owner/Admin');
    });

    it('harus mengembalikan 200 dan memperbarui status jika dirubah oleh owner', async () => {
      mockSession.role = 'owner';
      const req = new NextRequest('http://localhost/api/orders/ord-123', {
        method: 'PUT',
        body: JSON.stringify({ status: 3 }),
        headers: { 'cookie': 'token=validToken' }
      });

      const response = await PUT(req, { params: Promise.resolve({ id: 'ord-123' }) });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('Status pesanan berhasil diperbarui');
      expect(body.data.status).toBe(3);
    });

    it('harus mengembalikan 400 jika customer mengunggah bukti pembayaran padahal status order bukan Menunggu Pembayaran (7)', async () => {
      mockOrder.status = 2; // proses, bukan status 7
      const req = new NextRequest('http://localhost/api/orders/ord-123', {
        method: 'PUT',
        body: JSON.stringify({ bukti_pembayaran: 'data:image/png;base64,dummyImageContent' }),
        headers: { 'cookie': 'token=validToken' }
      });

      const response = await PUT(req, { params: Promise.resolve({ id: 'ord-123' }) });
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('Bukti pembayaran hanya dapat diunggah saat status pesanan adalah Menunggu Pembayaran');
    });

    it('harus mengembalikan 200 jika customer sukses mengunggah bukti pembayaran di status Menunggu Pembayaran (7)', async () => {
      mockOrder.status = 7; // Menunggu pembayaran
      const req = new NextRequest('http://localhost/api/orders/ord-123', {
        method: 'PUT',
        body: JSON.stringify({ bukti_pembayaran: 'data:image/png;base64,dummyImageContent' }),
        headers: { 'cookie': 'token=validToken' }
      });

      const response = await PUT(req, { params: Promise.resolve({ id: 'ord-123' }) });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('Bukti pembayaran berhasil diunggah');
    });
  });
});
