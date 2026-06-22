import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';

// Setup mock variables so we can control database output per test
let mockUser: any = null;
let mockUserError: any = null;
let mockProfile: any = null;
let mockProfileError: any = null;
let mockTenant: any = null;
let mockRateLimitAllowed = true;

// 1. Mock Supabase
vi.mock('@/lib/supabaseAdmin', () => {
  return {
    supabaseAdmin: {
      from: vi.fn().mockImplementation((table: string) => {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockImplementation(() => {
            if (table === 'auth_users') {
              return { data: mockUser, error: mockUserError };
            }
            if (table === 'profiles') {
              return { data: mockProfile, error: mockProfileError };
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

// 2. Mock bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn().mockImplementation((pass: string, hash: string) => {
      return Promise.resolve(pass === 'validPassword123');
    })
  }
}));

// 3. Mock Rate Limiter
vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: vi.fn().mockImplementation(() => {
    return Promise.resolve({
      allowed: mockRateLimitAllowed,
      remainingMs: 3600000
    });
  }),
  incrementRateLimit: vi.fn().mockResolvedValue(undefined),
  resetRateLimit: vi.fn().mockResolvedValue(undefined)
}));

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    // Reset mock variables to standard valid credentials before each test
    mockUser = { id: 'usr-123', email: 'test@user.com', password: 'hashedPassword', created_at: '2026-06-21' };
    mockUserError = null;
    mockProfile = { id: 'prof-123', full_name: 'Budi Test', role_id: 'role-123', kode_tenant: 'TEN-ABC', roles: { name: 'admin' } };
    mockProfileError = null;
    mockTenant = { id: 'tenant-123' };
    mockRateLimitAllowed = true;
  });

  it('harus mengembalikan status 400 jika email atau password kosong', async () => {
    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: '', password: '' })
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain('tidak boleh kosong');
  });

  it('harus mengembalikan status 429 jika percobaan login melebihi rate-limit', async () => {
    mockRateLimitAllowed = false;

    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@user.com', password: 'validPassword123' })
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.error).toContain('terlalu banyak');
  });

  it('harus mengembalikan status 401 jika user tidak terdaftar', async () => {
    mockUser = null;
    mockUserError = { message: 'User not found' };

    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'unknown@user.com', password: 'somePassword' })
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toContain('Email atau password salah');
  });

  it('harus mengembalikan status 401 jika password salah', async () => {
    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@user.com', password: 'wrongPassword' })
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toContain('Email atau password salah');
  });

  it('harus mengembalikan status 200 dan mengatur cookie session jika login sukses', async () => {
    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@user.com', password: 'validPassword123' })
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe('Login berhasil');
    expect(body.redirectPath).toBe('/home');
    
    // Verifikasi cookie token diset di response headers
    const cookie = response.headers.get('set-cookie');
    expect(cookie).toContain('token=');
    expect(cookie).toContain('HttpOnly');
  });
});
