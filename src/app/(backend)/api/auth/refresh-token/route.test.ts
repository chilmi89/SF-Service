import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

let mockProfile: any = null;
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
            if (table === 'tenants') {
              return { data: mockTenant, error: null };
            }
            return { data: null, error: null };
          })
        };
      })
    }
  };
});

// 2. Mock Session
vi.mock('@/lib/session', () => ({
  verifySessionToken: vi.fn().mockImplementation(() => {
    return Promise.resolve(mockSession);
  }),
  createSessionToken: vi.fn().mockResolvedValue('dummy-new-token')
}));

describe('POST /api/auth/refresh-token', () => {
  beforeEach(() => {
    mockSession = { userId: 'usr-123', email: 'test@user.com', role: 'customer' };
    mockProfile = { id: 'prof-123', kode_tenant: 'TEN-123', roles: { name: 'owner' } };
    mockTenant = { id: 'tenant-123' };
  });

  it('harus mengembalikan status 401 jika token session tidak ada', async () => {
    const req = new NextRequest('http://localhost/api/auth/refresh-token', {
      method: 'POST'
    });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Sesi tidak ditemukan');
  });

  it('harus mengembalikan status 401 jika token session tidak valid', async () => {
    mockSession = null;
    const req = new NextRequest('http://localhost/api/auth/refresh-token', {
      method: 'POST',
      headers: { 'cookie': 'token=invalidToken' }
    });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Sesi tidak valid');
  });

  it('harus mengembalikan status 200 dan mengatur cookie session baru jika refresh sukses', async () => {
    const req = new NextRequest('http://localhost/api/auth/refresh-token', {
      method: 'POST',
      headers: { 'cookie': 'token=validToken' }
    });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe('Sesi berhasil diperbarui');

    const cookie = response.headers.get('set-cookie');
    expect(cookie).toContain('token=dummy-new-token');
  });
});
