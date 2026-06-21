import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import { NextRequest } from 'next/server';

let mockSession: any = null;
let mockTargetProfile: any = null;
let mockOwnerProfile: any = null;
let mockNormalRole: any = null;
let mockUpdateError: any = null;

// Mock Supabase
vi.mock('@/lib/supabaseAdmin', () => {
  let tableCalled = '';
  let lastEqField = '';
  let lastEqValue = '';

  const builder: any = {
    select: vi.fn().mockImplementation(() => builder),
    eq: vi.fn().mockImplementation((field, val) => {
      lastEqField = field;
      lastEqValue = val;
      return builder;
    }),
    update: vi.fn().mockImplementation(() => {
      return {
        eq: vi.fn().mockImplementation(() => {
          return Promise.resolve({ error: mockUpdateError });
        })
      };
    }),
    single: vi.fn().mockImplementation(() => {
      if (tableCalled === 'profiles') {
        if (lastEqField === 'id') {
          return Promise.resolve({ data: mockTargetProfile, error: null });
        } else if (lastEqField === 'user_id') {
          return Promise.resolve({ data: mockOwnerProfile, error: null });
        }
      } else if (tableCalled === 'roles') {
        if (lastEqValue === 'user biasa') {
          return Promise.resolve({ data: mockNormalRole, error: null });
        }
      }
      return Promise.resolve({ data: null, error: null });
    })
  };

  return {
    supabaseAdmin: {
      from: vi.fn().mockImplementation((table) => {
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

describe('Tenants Staff Detail API Endpoint (/api/tenants/staff/[id])', () => {
  beforeEach(() => {
    mockSession = { userId: 'usr-owner', role: 'owner' };
    mockTargetProfile = { id: 'prof-staff', kode_tenant: 'TEN-123', user_id: 'usr-staff' };
    mockOwnerProfile = { kode_tenant: 'TEN-123' };
    mockNormalRole = { id: 'role-normal' };
    mockUpdateError = null;
  });

  describe('DELETE /api/tenants/staff/[id]', () => {
    it('harus mengembalikan status 401 jika tidak ada token/session', async () => {
      mockSession = null;
      const req = new NextRequest('http://localhost/api/tenants/staff/prof-staff', {
        method: 'DELETE'
      });
      const response = await DELETE(req, { params: Promise.resolve({ id: 'prof-staff' }) });
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toContain('Tidak sah');
    });

    it('harus mengembalikan status 404 jika target staff tidak ditemukan', async () => {
      mockTargetProfile = null;
      const req = new NextRequest('http://localhost/api/tenants/staff/prof-staff-not-found', {
        method: 'DELETE',
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await DELETE(req, { params: Promise.resolve({ id: 'prof-staff-not-found' }) });
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toContain('tidak ditemukan');
    });

    it('harus mengembalikan status 403 jika owner dari tenant lain mencoba menghapus staf', async () => {
      mockOwnerProfile = { kode_tenant: 'TEN-DIFFERENT' };
      const req = new NextRequest('http://localhost/api/tenants/staff/prof-staff', {
        method: 'DELETE',
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await DELETE(req, { params: Promise.resolve({ id: 'prof-staff' }) });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain('Akses ditolak');
    });

    it('harus mengizinkan super admin menghapus staf meskipun beda tenant', async () => {
      mockSession.role = 'super admin';
      mockOwnerProfile = { kode_tenant: 'TEN-DIFFERENT' }; // super admin can have any tenant or none
      const req = new NextRequest('http://localhost/api/tenants/staff/prof-staff', {
        method: 'DELETE',
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await DELETE(req, { params: Promise.resolve({ id: 'prof-staff' }) });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toContain('berhasil dihapus');
    });

    it('harus mengembalikan status 200 jika owner menghapus staf dari tenant yang sama', async () => {
      const req = new NextRequest('http://localhost/api/tenants/staff/prof-staff', {
        method: 'DELETE',
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await DELETE(req, { params: Promise.resolve({ id: 'prof-staff' }) });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toContain('berhasil dihapus');
    });

    it('harus mengembalikan status 500 jika terjadi error database saat memperbarui data', async () => {
      mockUpdateError = new Error('Database error');
      const req = new NextRequest('http://localhost/api/tenants/staff/prof-staff', {
        method: 'DELETE',
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await DELETE(req, { params: Promise.resolve({ id: 'prof-staff' }) });
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toContain('Gagal menghapus staf');
    });
  });
});
