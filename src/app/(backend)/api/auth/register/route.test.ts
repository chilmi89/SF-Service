import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

let mockExistingUser: any = null;
let mockInsertUserError: any = null;
let mockInsertedUser: any = null;
let mockRoleData: any = null;
let mockProfileInsertError: any = null;

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
              return { data: mockExistingUser, error: null };
            }
            if (table === 'roles') {
              return { data: mockRoleData, error: null };
            }
            return { data: null, error: null };
          }),
          insert: vi.fn().mockImplementation((payload: any) => {
            return {
              select: vi.fn().mockReturnThis(),
              single: vi.fn().mockImplementation(() => {
                if (table === 'auth_users') {
                  if (mockInsertUserError) {
                    return { data: null, error: mockInsertUserError };
                  }
                  return { data: mockInsertedUser, error: null };
                }
                return { data: null, error: mockProfileInsertError };
              }),
              // profiles insert doesn't call select().single()
              then: vi.fn().mockImplementation((callback: any) => {
                if (table === 'profiles') {
                  return callback({ data: null, error: mockProfileInsertError });
                }
                return callback({ data: null, error: null });
              })
            };
          })
        };
      })
    }
  };
});

// 2. Mock bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    genSalt: vi.fn().mockResolvedValue('salt'),
    hash: vi.fn().mockResolvedValue('hashedPassword')
  }
}));

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    mockExistingUser = null;
    mockInsertUserError = null;
    mockInsertedUser = { id: 'usr-456', email: 'new@user.com', created_at: '2026-06-21' };
    mockRoleData = { id: 'role-normal-user' };
    mockProfileInsertError = null;
  });

  it('harus mengembalikan status 400 jika email atau password kosong', async () => {
    const req = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: '', password: '' })
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain('tidak boleh kosong');
  });

  it('harus mengembalikan status 409 jika email sudah terdaftar', async () => {
    mockExistingUser = { id: 'usr-123' };

    const req = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'existing@user.com', password: 'password123' })
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toContain('sudah terdaftar');
  });

  it('harus mengembalikan status 500 jika gagal melakukan insert user', async () => {
    mockInsertUserError = { message: 'Database insert failed' };

    const req = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'new@user.com', password: 'password123' })
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toContain('Gagal mendaftar user baru');
  });

  it('harus mengembalikan status 201 dan mengatur cookie session jika pendaftaran sukses', async () => {
    const req = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'new@user.com', password: 'password123' })
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.message).toContain('Registrasi berhasil');
    expect(body.user.email).toBe('new@user.com');
    expect(body.redirectPath).toBe('/home');

    // Verifikasi cookie token diset
    const cookie = response.headers.get('set-cookie');
    expect(cookie).toContain('token=');
    expect(cookie).toContain('HttpOnly');
  });
});
