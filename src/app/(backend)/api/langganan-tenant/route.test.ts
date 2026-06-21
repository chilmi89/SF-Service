import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

let mockSession: any = null;
let mockProfile: any = null;
let mockTenant: any = null;
let mockLanggananTenantList: any[] = [];
let mockLanggananTenantInsert: any = null;
let mockRolesList: any[] = [];

// Mock Supabase
vi.mock('@/lib/supabaseAdmin', () => {
  const builder: any = {
    select: vi.fn().mockImplementation(() => builder),
    eq: vi.fn().mockImplementation(() => builder),
    in: vi.fn().mockImplementation(() => builder),
    insert: vi.fn().mockImplementation(() => builder),
    update: vi.fn().mockImplementation(() => builder),
    single: vi.fn().mockImplementation(() => {
      // Dapatkan data single berdasarkan target pemanggilan
      return Promise.resolve({ data: mockTenant || mockProfile, error: null });
    }),
    then: vi.fn().mockImplementation((callback: any) => {
      // Untuk GET query
      return Promise.resolve(callback({ data: mockLanggananTenantList, error: null }));
    })
  };
  return {
    supabaseAdmin: {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'roles') {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({ data: mockRolesList, error: null })
          };
        }
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

describe('Langganan Tenant API Endpoint (/api/langganan-tenant)', () => {
  beforeEach(() => {
    mockSession = { userId: 'usr-123', role: 'super admin' };
    mockProfile = { kode_tenant: 'TEN-123' };
    mockTenant = { id: 'tenant-123', name: 'Tenant A', kode_tenant: 'TEN-123' };
    mockLanggananTenantList = [
      { id: '1', kode_tenant: 'tenant-123', id_langganan: 'lang-1' }
    ];
    mockLanggananTenantInsert = { id: '1', kode_tenant: 'tenant-123', id_langganan: 'lang-1' };
    mockRolesList = [
      { id: 'role-owner', name: 'owner' },
      { id: 'role-owner-tunggal', name: 'owner tunggal' }
    ];
  });

  describe('GET /api/langganan-tenant', () => {
    it('harus mengembalikan 401 jika user belum login', async () => {
      mockSession = null;
      const req = new NextRequest('http://localhost/api/langganan-tenant');
      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe('Tidak sah');
    });

    it('harus mengembalikan daftar langganan tenant dengan status 200', async () => {
      const req = new NextRequest('http://localhost/api/langganan-tenant', {
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toBeDefined();
    });
  });

  describe('POST /api/langganan-tenant', () => {
    it('harus mengembalikan 400 jika kode_tenant atau id_langganan kosong', async () => {
      const req = new NextRequest('http://localhost/api/langganan-tenant', {
        method: 'POST',
        body: JSON.stringify({ kode_tenant: '', id_langganan: '' })
      });
      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('wajib diisi');
    });

    it('harus mengembalikan 201 jika tenant berhasil didaftarkan ke paket langganan', async () => {
      const req = new NextRequest('http://localhost/api/langganan-tenant', {
        method: 'POST',
        body: JSON.stringify({ kode_tenant: 'TEN-123', id_langganan: 'lang-1' })
      });
      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.message).toContain('Tenant berhasil didaftarkan');
    });
  });
});
