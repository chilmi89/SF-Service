import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

let mockLayananData: any[] = [];
let mockLayananInsertResult: any = null;
let mockSession: any = null;
let mockRateLimitAllowed = true;

// 1. Mock Supabase
vi.mock('@/lib/supabaseAdmin', () => {
  return {
    supabaseAdmin: {
      from: vi.fn().mockImplementation((table: string) => {
        return {
          select: vi.fn().mockImplementation(() => {
            return {
              eq: vi.fn().mockImplementation(() => {
                return Promise.resolve({ data: mockLayananData, error: null });
              }),
              then: vi.fn().mockImplementation((callback: any) => {
                return Promise.resolve(callback({ data: mockLayananData, error: null }));
              })
            };
          }),
          insert: vi.fn().mockImplementation((payload: any) => {
            return {
              select: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({ data: mockLayananInsertResult, error: null })
            };
          })
        };
      })
    }
  };
});

// 2. Mock session verifySessionToken
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
      remainingMs: 3600000
    });
  })
}));

// 4. Mock Cloudinary
vi.mock('@/lib/cloudinary', () => ({
  default: {
    uploader: {
      upload_stream: vi.fn().mockImplementation((options, callback) => {
        callback(null, { secure_url: 'https://cloudinary.com/dummy.webp' });
        return {
          end: vi.fn()
        };
      }),
      upload: vi.fn().mockImplementation((image, options, callback) => {
        if (callback) {
          callback(null, { secure_url: 'https://cloudinary.com/dummy.webp' });
        }
        return Promise.resolve({ secure_url: 'https://cloudinary.com/dummy.webp' });
      })
    }
  }
}));

describe('Layanan API Endpoint (/api/layanan)', () => {
  beforeEach(() => {
    mockLayananData = [
      { id: 'lay-1', nama_layanan: 'Cuci AC', harga_dasar: 75000, tenants: { name: 'AC Shop' } }
    ];
    mockLayananInsertResult = { id: 'lay-2', nama_layanan: 'Tambal Freon', harga_dasar: 150000 };
    mockSession = { userId: 'usr-123', role: 'owner', tenantId: 'tenant-123' };
    mockRateLimitAllowed = true;
  });

  describe('GET /api/layanan', () => {
    it('harus mengembalikan daftar layanan dengan status 200', async () => {
      const req = new NextRequest('http://localhost/api/layanan');
      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].nama_layanan).toBe('Cuci AC');
    });
  });

  describe('POST /api/layanan', () => {
    it('harus mengembalikan 401 jika user tidak memiliki token login', async () => {
      mockSession = null;
      const req = new NextRequest('http://localhost/api/layanan', {
        method: 'POST',
        body: JSON.stringify({ nama_layanan: 'Test', harga_dasar: 5000, id_kategori: 1 })
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toContain('Tidak sah');
    });

    it('harus mengembalikan 403 jika role user bukan owner', async () => {
      mockSession = { userId: 'usr-123', role: 'teknisi', tenantId: 'tenant-123' };
      const req = new NextRequest('http://localhost/api/layanan', {
        method: 'POST',
        body: JSON.stringify({ nama_layanan: 'Test', harga_dasar: 5000, id_kategori: 1 }),
        headers: {
          'cookie': 'token=validToken'
        }
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain('Hanya Owner');
    });

    it('harus mengembalikan 429 jika rate-limit terlampaui (max 5 kali)', async () => {
      mockRateLimitAllowed = false;
      const req = new NextRequest('http://localhost/api/layanan', {
        method: 'POST',
        body: JSON.stringify({ nama_layanan: 'Test', harga_dasar: 5000, id_kategori: 1 }),
        headers: {
          'cookie': 'token=validToken'
        }
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(429);
      expect(body.error).toContain('mencapai batas maksimal');
    });

    it('harus mengembalikan 201 jika data layanan sukses ditambahkan', async () => {
      const req = new NextRequest('http://localhost/api/layanan', {
        method: 'POST',
        body: JSON.stringify({ nama_layanan: 'Tambal Freon', harga_dasar: 150000, id_kategori: 1 }),
        headers: {
          'cookie': 'token=validToken'
        }
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.message).toBe('Layanan berhasil ditambahkan');
      expect(body.data.nama_layanan).toBe('Tambal Freon');
    });
  });
});
