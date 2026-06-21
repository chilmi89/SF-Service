import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from './route';
import { NextRequest } from 'next/server';

let mockTenant: any = null;
let mockProfile: any = null;
let mockRole: any = null;
let mockSession: any = null;

// Mock Supabase
vi.mock('@/lib/supabaseAdmin', () => {
  let tableCalled = '';

  const builder: any = {
    select: vi.fn().mockImplementation(() => builder),
    eq: vi.fn().mockImplementation(() => builder),
    update: vi.fn().mockImplementation(() => builder),
    delete: vi.fn().mockImplementation(() => builder),
    single: vi.fn().mockImplementation(() => {
      if (tableCalled === 'tenants') {
        return Promise.resolve({ data: mockTenant, error: null });
      }
      if (tableCalled === 'profiles') {
        return Promise.resolve({ data: mockProfile, error: null });
      }
      if (tableCalled === 'roles') {
        return Promise.resolve({ data: mockRole, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    })
  };
  return {
    supabaseAdmin: {
      from: vi.fn().mockImplementation((table: string) => {
        tableCalled = table;
        return builder;
      })
    }
  };
});

// Mock Session
vi.mock('@/lib/session', () => ({
  verifySessionToken: vi.fn().mockImplementation(() => {
    return Promise.resolve(mockSession);
  })
}));

// Mock Cloudinary
vi.mock('@/lib/cloudinary', () => ({
  default: {
    uploader: {
      upload: vi.fn().mockResolvedValue({ secure_url: 'https://cloudinary.com/tenant.webp' }),
      upload_stream: vi.fn().mockImplementation((options, callback) => {
        callback(null, { secure_url: 'https://cloudinary.com/tenant.webp' });
        return { end: vi.fn() };
      })
    }
  }
}));

describe('Tenant Detail API Endpoint (/api/tenants/[id])', () => {
  beforeEach(() => {
    mockTenant = { id: 'tenant-123', name: 'Servis AC Budi', slug: 'servis-ac-budi', kode_tenant: 'TEN-123' };
    mockProfile = { id: 'prof-123', kode_tenant: 'TEN-123' };
    mockRole = { id: 'role-normal-user', name: 'user biasa' };
    mockSession = { userId: 'usr-123', role: 'owner' };
  });

  describe('GET /api/tenants/[id]', () => {
    it('harus mengembalikan detail tenant dengan status 200', async () => {
      const req = new NextRequest('http://localhost/api/tenants/tenant-123');
      const response = await GET(req, { params: Promise.resolve({ id: 'tenant-123' }) });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.id).toBe('tenant-123');
    });
  });

  describe('PUT /api/tenants/[id]', () => {
    it('harus mengembalikan 401 jika user belum login', async () => {
      mockSession = null;
      const req = new NextRequest('http://localhost/api/tenants/tenant-123', {
        method: 'PUT',
        body: JSON.stringify({ phone: '08123' })
      });
      const response = await PUT(req, { params: Promise.resolve({ id: 'tenant-123' }) });
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe('Tidak sah');
    });

    it('harus mengembalikan 403 jika user bukan pemilik tenant (owner yang salah)', async () => {
      mockProfile.kode_tenant = 'TEN-DIFFERENT'; // Kode tenant berbeda
      const req = new NextRequest('http://localhost/api/tenants/tenant-123', {
        method: 'PUT',
        body: JSON.stringify({ phone: '08123' }),
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await PUT(req, { params: Promise.resolve({ id: 'tenant-123' }) });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain('Akses ditolak');
    });

    it('harus mengembalikan 200 dan data updated jika diubah oleh owner yang sah', async () => {
      const req = new NextRequest('http://localhost/api/tenants/tenant-123', {
        method: 'PUT',
        body: JSON.stringify({ phone: '08123' }),
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await PUT(req, { params: Promise.resolve({ id: 'tenant-123' }) });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('Data tenant berhasil diperbarui.');
    });
  });

  describe('DELETE /api/tenants/[id]', () => {
    it('harus mengembalikan 403 jika user bukan owner/pemilik', async () => {
      mockProfile.kode_tenant = 'TEN-DIFFERENT';
      const req = new NextRequest('http://localhost/api/tenants/tenant-123', {
        method: 'DELETE',
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await DELETE(req, { params: Promise.resolve({ id: 'tenant-123' }) });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain('Akses ditolak');
    });

    it('harus mengembalikan 200 jika tenant berhasil dihapus oleh owner yang sah', async () => {
      const req = new NextRequest('http://localhost/api/tenants/tenant-123', {
        method: 'DELETE',
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await DELETE(req, { params: Promise.resolve({ id: 'tenant-123' }) });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toContain('Tenant berhasil dihapus');
    });
  });
});
