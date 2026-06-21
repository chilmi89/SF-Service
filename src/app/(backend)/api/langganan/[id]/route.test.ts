import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from './route';
import { NextRequest } from 'next/server';

let mockPackage: any = null;
let mockSession: any = null;

// Mock Supabase
vi.mock('@/lib/supabaseAdmin', () => {
  const builder: any = {
    select: vi.fn().mockImplementation(() => builder),
    eq: vi.fn().mockImplementation(() => builder),
    update: vi.fn().mockImplementation(() => builder),
    delete: vi.fn().mockImplementation(() => builder),
    single: vi.fn().mockImplementation(() => {
      return Promise.resolve({ data: mockPackage, error: mockPackage ? null : { message: 'Not found' } });
    }),
    then: vi.fn().mockImplementation((callback: any) => {
      return Promise.resolve(callback({ error: null }));
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

describe('Langganan Detail API Endpoint (/api/langganan/[id])', () => {
  beforeEach(() => {
    mockPackage = { id: '1', harga: 50000, durasi: 30 };
    mockSession = { userId: 'usr-admin', role: 'super admin' };
  });

  describe('GET /api/langganan/[id]', () => {
    it('harus mengembalikan detail paket langganan dengan status 200', async () => {
      const req = new NextRequest('http://localhost/api/langganan/1');
      const response = await GET(req, { params: Promise.resolve({ id: '1' }) });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.id).toBe('1');
    });

    it('harus mengembalikan status 404 jika paket tidak ditemukan', async () => {
      mockPackage = null;
      const req = new NextRequest('http://localhost/api/langganan/unknown');
      const response = await GET(req, { params: Promise.resolve({ id: 'unknown' }) });
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toContain('tidak ditemukan');
    });
  });

  describe('PUT /api/langganan/[id]', () => {
    it('harus mengembalikan status 403 jika role bukan super admin', async () => {
      mockSession.role = 'customer';
      const req = new NextRequest('http://localhost/api/langganan/1', {
        method: 'PUT',
        body: JSON.stringify({ harga: 60000 }),
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await PUT(req, { params: Promise.resolve({ id: '1' }) });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toBe('Akses ditolak.');
    });

    it('harus mengembalikan status 200 jika paket berhasil diupdate oleh super admin', async () => {
      const req = new NextRequest('http://localhost/api/langganan/1', {
        method: 'PUT',
        body: JSON.stringify({ harga: 60000 }),
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await PUT(req, { params: Promise.resolve({ id: '1' }) });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('Paket langganan berhasil diperbarui.');
    });
  });

  describe('DELETE /api/langganan/[id]', () => {
    it('harus mengembalikan status 403 jika role bukan super admin', async () => {
      mockSession.role = 'customer';
      const req = new NextRequest('http://localhost/api/langganan/1', {
        method: 'DELETE',
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await DELETE(req, { params: Promise.resolve({ id: '1' }) });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toBe('Akses ditolak.');
    });

    it('harus mengembalikan status 200 jika paket berhasil dihapus', async () => {
      const req = new NextRequest('http://localhost/api/langganan/1', {
        method: 'DELETE',
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await DELETE(req, { params: Promise.resolve({ id: '1' }) });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('Paket langganan berhasil dihapus.');
    });
  });
});
