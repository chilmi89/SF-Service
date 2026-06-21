import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

let mockTenantsList: any[] = [];
let mockProfile: any = null;
let mockRole: any = null;
let mockTenantInsert: any = null;
let mockSession: any = null;

// Mock Supabase
vi.mock('@/lib/supabaseAdmin', () => {
  let tableCalled = '';

  const builder: any = {
    select: vi.fn().mockImplementation(() => builder),
    eq: vi.fn().mockImplementation(() => builder),
    order: vi.fn().mockImplementation(() => {
      return Promise.resolve({ data: mockTenantsList, error: null });
    }),
    insert: vi.fn().mockImplementation(() => builder),
    update: vi.fn().mockImplementation(() => builder),
    single: vi.fn().mockImplementation(() => {
      if (tableCalled === 'profiles') {
        return Promise.resolve({ data: mockProfile, error: null });
      }
      if (tableCalled === 'tenants') {
        return Promise.resolve({ data: mockTenantInsert, error: null });
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
  }),
  createSessionToken: vi.fn().mockResolvedValue('dummy-new-token')
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

describe('Tenants API Endpoint (/api/tenants)', () => {
  beforeEach(() => {
    mockTenantsList = [{ id: '1', name: 'Servis AC Budi', slug: 'servis-ac-budi' }];
    mockProfile = { full_name: 'Budi Owner', phone: '08123456', kode_tenant: null };
    mockRole = { id: 'role-owner-tunggal', name: 'owner tunggal' };
    mockTenantInsert = { id: 'tenant-new', name: 'Servis Baru', slug: 'servis-baru' };
    mockSession = { userId: 'usr-123', role: 'user biasa', email: 'budi@owner.com' };
  });

  describe('GET /api/tenants', () => {
    it('harus mengembalikan daftar tenant dengan status 200', async () => {
      const response = await GET(new NextRequest('http://localhost/api/tenants'));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].name).toBe('Servis AC Budi');
    });
  });

  describe('POST /api/tenants', () => {
    it('harus mengembalikan 401 jika user belum login', async () => {
      mockSession = null;
      const req = new NextRequest('http://localhost/api/tenants', {
        method: 'POST',
        body: JSON.stringify({ name: 'Servis Baru' })
      });
      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toContain('Sesi tidak valid');
    });

    it('harus mengembalikan 403 jika role user bukan user biasa', async () => {
      mockSession.role = 'owner';
      const req = new NextRequest('http://localhost/api/tenants', {
        method: 'POST',
        body: JSON.stringify({ name: 'Servis Baru' }),
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain('Hanya pengguna dengan role "user biasa"');
    });

    it('harus mengembalikan 403 jika profile user belum lengkap', async () => {
      mockProfile.phone = ''; // Phone kosong
      const req = new NextRequest('http://localhost/api/tenants', {
        method: 'POST',
        body: JSON.stringify({ name: 'Servis Baru' }),
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain('Profil belum lengkap');
    });

    it('harus mengembalikan 201 jika pendaftaran tenant sukses dan upgrade role user', async () => {
      const req = new NextRequest('http://localhost/api/tenants', {
        method: 'POST',
        body: JSON.stringify({ name: 'Servis Baru', address: 'Malang', phone: '08123' }),
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.message).toContain('Tenant berhasil dibuat');
      expect(body.data.name).toBe('Servis Baru');

      const cookie = response.headers.get('set-cookie');
      expect(cookie).toContain('token=dummy-new-token'); // Check role upgrade cookie diset
    });
  });
});
