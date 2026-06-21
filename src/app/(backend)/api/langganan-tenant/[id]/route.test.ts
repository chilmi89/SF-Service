import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from './route';
import { NextRequest } from 'next/server';

let mockLanggananTenant: any = null;
let mockTenant: any = null;
let mockRolesList: any[] = [];

// Mock Supabase
vi.mock('@/lib/supabaseAdmin', () => {
  const builder: any = {
    select: vi.fn().mockImplementation(() => builder),
    eq: vi.fn().mockImplementation(() => builder),
    update: vi.fn().mockImplementation(() => builder),
    delete: vi.fn().mockImplementation(() => builder),
    single: vi.fn().mockImplementation(() => {
      return Promise.resolve({ data: mockLanggananTenant || mockTenant, error: null });
    }),
    in: vi.fn().mockImplementation(() => Promise.resolve({ data: mockRolesList, error: null }))
  };
  return {
    supabaseAdmin: {
      from: vi.fn().mockImplementation(() => builder)
    }
  };
});

describe('Langganan Tenant Detail API Endpoint (/api/langganan-tenant/[id])', () => {
  beforeEach(() => {
    mockLanggananTenant = { id: '1', kode_tenant: 'tenant-123', id_langganan: 'lang-1' };
    mockTenant = { id: 'tenant-123', kode_tenant: 'TEN-123' };
    mockRolesList = [
      { id: 'role-owner', name: 'owner' },
      { id: 'role-owner-tunggal', name: 'owner tunggal' }
    ];
  });

  describe('GET /api/langganan-tenant/[id]', () => {
    it('harus mengembalikan detail langganan tenant dengan status 200', async () => {
      const req = new NextRequest('http://localhost/api/langganan-tenant/1');
      const response = await GET(req, { params: Promise.resolve({ id: '1' }) });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.id).toBe('1');
    });
  });

  describe('PUT /api/langganan-tenant/[id]', () => {
    it('harus mengembalikan status 200 jika data langganan berhasil diupdate', async () => {
      const req = new NextRequest('http://localhost/api/langganan-tenant/1', {
        method: 'PUT',
        body: JSON.stringify({ id_langganan: 'lang-new', kode_tenant: 'tenant-123' })
      });
      const response = await PUT(req, { params: Promise.resolve({ id: '1' }) });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('Data langganan berhasil diperbarui.');
    });
  });

  describe('DELETE /api/langganan-tenant/[id]', () => {
    it('harus mengembalikan status 200 jika data langganan berhasil dicabut', async () => {
      const req = new NextRequest('http://localhost/api/langganan-tenant/1', {
        method: 'DELETE'
      });
      const response = await DELETE(req, { params: Promise.resolve({ id: '1' }) });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('Data langganan berhasil dihapus.');
    });
  });
});
