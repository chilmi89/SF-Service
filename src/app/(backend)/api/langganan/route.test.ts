import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

let mockPackages: any[] = [];
let mockPackageInsertResult: any = null;
let mockSession: any = null;

// Mock Supabase
vi.mock('@/lib/supabaseAdmin', () => {
  const builder: any = {
    select: vi.fn().mockImplementation(() => builder),
    order: vi.fn().mockImplementation(() => {
      return Promise.resolve({ data: mockPackages, error: null });
    }),
    insert: vi.fn().mockImplementation(() => builder),
    single: vi.fn().mockImplementation(() => {
      return Promise.resolve({ data: mockPackageInsertResult, error: null });
    })
  };
  return {
    supabaseAdmin: {
      from: vi.fn().mockImplementation(() => builder)
    }
  };
});

// Mock Session
vi.mock('@/lib/session', () => ({
  verifySessionToken: vi.fn().mockImplementation(() => {
    return Promise.resolve(mockSession);
  })
}));

describe('Langganan API Endpoint (/api/langganan)', () => {
  beforeEach(() => {
    mockPackages = [
      { id: '1', harga: 50000, durasi: 30 },
      { id: '2', harga: 120000, durasi: 90 }
    ];
    mockPackageInsertResult = { id: '3', harga: 200000, durasi: 180 };
    mockSession = { userId: 'usr-admin', role: 'super admin' };
  });

  describe('GET /api/langganan', () => {
    it('harus mengembalikan semua daftar paket langganan', async () => {
      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toHaveLength(2);
      expect(body.data[0].harga).toBe(50000);
    });
  });

  describe('POST /api/langganan', () => {
    it('harus mengembalikan 401 jika sesi tidak valid', async () => {
      mockSession = null;
      const req = new NextRequest('http://localhost/api/langganan', {
        method: 'POST',
        body: JSON.stringify({ harga: 200000, durasi: 180 })
      });
      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toContain('belum login');
    });

    it('harus mengembalikan 403 jika role bukan super admin', async () => {
      mockSession.role = 'customer';
      const req = new NextRequest('http://localhost/api/langganan', {
        method: 'POST',
        body: JSON.stringify({ harga: 200000, durasi: 180 }),
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain('Hanya Super Admin');
    });

    it('harus mengembalikan 201 dan data paket baru jika berhasil dibuat', async () => {
      const req = new NextRequest('http://localhost/api/langganan', {
        method: 'POST',
        body: JSON.stringify({ harga: 200000, durasi: 180 }),
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.message).toBe('Paket langganan berhasil dibuat.');
      expect(body.data.harga).toBe(200000);
    });
  });
});
