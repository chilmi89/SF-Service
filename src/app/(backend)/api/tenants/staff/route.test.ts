import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

let mockSession: any = null;
let mockOwnerProfile: any = null;
let mockTenantRef: any = null;
let mockSubCheck: any = null;
let mockTargetUser: any = null;
let mockTargetProfile: any = null;
let mockRoleData: any = null;
let mockStaffList: any[] = [];

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
    neq: vi.fn().mockImplementation(() => builder),
    order: vi.fn().mockImplementation(() => {
      return Promise.resolve({ data: mockStaffList, error: null });
    }),
    update: vi.fn().mockImplementation(() => builder),
    single: vi.fn().mockImplementation(() => {
      if (tableCalled === 'profiles') {
        if (lastEqField === 'user_id') {
          if (lastEqValue === 'usr-owner') {
            return Promise.resolve({ data: mockOwnerProfile, error: null });
          } else {
            return Promise.resolve({ data: mockTargetProfile, error: null });
          }
        }
        return Promise.resolve({ data: mockOwnerProfile, error: null });
      }
      if (tableCalled === 'tenants') {
        return Promise.resolve({ data: mockTenantRef, error: null });
      }
      if (tableCalled === 'roles') {
        return Promise.resolve({ data: mockRoleData, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    }),
    maybeSingle: vi.fn().mockImplementation(() => {
      if (tableCalled === 'Langganan_tenant') {
        return Promise.resolve({ data: mockSubCheck, error: null });
      }
      if (tableCalled === 'auth_users') {
        return Promise.resolve({ data: mockTargetUser, error: null });
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

describe('Tenants Staff API Endpoint (/api/tenants/staff)', () => {
  beforeEach(() => {
    mockSession = { userId: 'usr-owner', role: 'owner' };
    mockOwnerProfile = { kode_tenant: 'TEN-123' };
    mockTenantRef = { id: 'tenant-123' };
    mockSubCheck = { id: 'sub-123' };
    mockTargetUser = { id: 'usr-staff' };
    mockTargetProfile = { id: 'prof-staff', kode_tenant: null };
    mockRoleData = { id: 'role-teknisi' };
    mockStaffList = [
      { id: 'prof-staff', full_name: 'Budi Staf', phone: '123', kode_tenant: 'TEN-123', roles: { name: 'teknisi' }, auth_users: { email: 'staff@test.com' } }
    ];
  });

  describe('GET /api/tenants/staff', () => {
    it('harus mengembalikan daftar staf dengan status 200', async () => {
      const req = new NextRequest('http://localhost/api/tenants/staff', {
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].full_name).toBe('Budi Staf');
    });
  });

  describe('POST /api/tenants/staff', () => {
    it('harus mengembalikan status 403 jika role user bukan owner/admin', async () => {
      mockSession.role = 'teknisi';
      const req = new NextRequest('http://localhost/api/tenants/staff', {
        method: 'POST',
        body: JSON.stringify({ email: 'staff@test.com', role_name: 'teknisi' }),
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain('Hanya Pemilik Tenant');
    });

    it('harus mengembalikan status 201 jika pendaftaran staf sukses', async () => {
      const req = new NextRequest('http://localhost/api/tenants/staff', {
        method: 'POST',
        body: JSON.stringify({ email: 'staff@test.com', role_name: 'teknisi' }),
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.message).toContain('Berhasil menambahkan staf');
    });
  });
});
