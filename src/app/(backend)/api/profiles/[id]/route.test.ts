import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from './route';
import { NextRequest } from 'next/server';

let mockProfile: any = null;
let mockAuthUserUpdateError: any = null;
let mockRateLimitAllowed = true;
let mockRateLimitRemaining = 0;

// Mock Supabase
vi.mock('@/lib/supabaseAdmin', () => {
  let tableCalled = '';

  const builder: any = {
    then: vi.fn().mockImplementation((onfulfilled) => {
      if (tableCalled === 'auth_users' && mockAuthUserUpdateError) {
        return Promise.resolve({ error: mockAuthUserUpdateError }).then(onfulfilled);
      }
      return Promise.resolve({ data: mockProfile, error: null }).then(onfulfilled);
    }),
    select: vi.fn().mockImplementation(() => builder),
    eq: vi.fn().mockImplementation(() => builder),
    update: vi.fn().mockImplementation(() => builder),
    delete: vi.fn().mockImplementation(() => builder),
    single: vi.fn().mockImplementation(() => {
      if (tableCalled === 'profiles') {
        return Promise.resolve({ data: mockProfile, error: null });
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
    return Promise.resolve({ userId: 'usr-123', role: 'user' });
  })
}));

// Mock Cloudinary
vi.mock('@/lib/cloudinary', () => ({
  default: {
    uploader: {
      upload: vi.fn().mockResolvedValue({ secure_url: 'http://cloudinary/avatar.webp' }),
      upload_stream: vi.fn().mockImplementation((options, callback) => {
        callback(null, { secure_url: 'http://cloudinary/avatar.webp' });
        return { end: vi.fn() };
      })
    }
  }
}));

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    genSalt: vi.fn().mockResolvedValue('salt'),
    hash: vi.fn().mockResolvedValue('hashedPassword')
  }
}));

// Mock Rate Limit
vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: vi.fn().mockImplementation(() => {
    return Promise.resolve({ allowed: mockRateLimitAllowed, remainingMs: mockRateLimitRemaining });
  })
}));

describe('Profile Detail API Endpoint (/api/profiles/[id])', () => {
  beforeEach(() => {
    mockProfile = {
      id: 'prof-123',
      full_name: 'Budi Santoso',
      phone: '0812',
      address: 'Malang',
      avatar_url: 'http://avatar',
      kode_tenant: 'TEN-123',
      user_id: 'usr-123',
      auth_users: {
        email: 'budi@test.com'
      },
      tenants: {
        name: 'Budi Service'
      }
    };
    mockAuthUserUpdateError = null;
    mockRateLimitAllowed = true;
    mockRateLimitRemaining = 0;
  });

  describe('GET /api/profiles/[id]', () => {
    it('harus mengembalikan 200 dan detail profil jika ditemukan', async () => {
      const req = new NextRequest('http://localhost/api/profiles/prof-123');
      const response = await GET(req, { params: Promise.resolve({ id: 'prof-123' }) });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.full_name).toBe('Budi Santoso');
      expect(body.data.email).toBe('budi@test.com');
      expect(body.data.tenant_name).toBe('Budi Service');
    });

    it('harus mengembalikan 404 jika profil tidak ditemukan', async () => {
      mockProfile = null;
      const req = new NextRequest('http://localhost/api/profiles/prof-not-found');
      const response = await GET(req, { params: Promise.resolve({ id: 'prof-not-found' }) });
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toContain('Profil tidak ditemukan');
    });
  });

  describe('PUT /api/profiles/[id]', () => {
    it('harus mengembalikan 401 jika tidak ada token/session', async () => {
      const req = new NextRequest('http://localhost/api/profiles/prof-123', {
        method: 'PUT',
        body: JSON.stringify({ full_name: 'Budi Baru' })
      });
      // override request cookies to have no token
      req.cookies.delete('token');
      const response = await PUT(req, { params: Promise.resolve({ id: 'prof-123' }) });
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toContain('Sesi habis');
    });

    it('harus mengembalikan 403 jika mencoba mengedit profil orang lain', async () => {
      mockProfile.user_id = 'usr-other'; // different user_id
      const req = new NextRequest('http://localhost/api/profiles/prof-123', {
        method: 'PUT',
        body: JSON.stringify({ full_name: 'Budi Baru' }),
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await PUT(req, { params: Promise.resolve({ id: 'prof-123' }) });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain('tidak memiliki akses');
    });

    it('harus mengembalikan 429 jika melanggar rate limit edit profil (1 minggu sekali)', async () => {
      mockRateLimitAllowed = false;
      mockRateLimitRemaining = 3 * 24 * 60 * 60 * 1000; // 3 days remaining
      const req = new NextRequest('http://localhost/api/profiles/prof-123', {
        method: 'PUT',
        body: JSON.stringify({ full_name: 'Budi Baru', phone: '0813' }),
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await PUT(req, { params: Promise.resolve({ id: 'prof-123' }) });
      const body = await response.json();

      expect(response.status).toBe(429);
      expect(body.error).toContain('diizinkan mengedit profil 1 kali dalam seminggu');
    });

    it('harus mengembalikan 200 jika update profil dan kredensial berhasil', async () => {
      const req = new NextRequest('http://localhost/api/profiles/prof-123', {
        method: 'PUT',
        body: JSON.stringify({
          full_name: 'Budi Baru',
          email: 'newemail@test.com',
          password: 'newpassword123'
        }),
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await PUT(req, { params: Promise.resolve({ id: 'prof-123' }) });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toContain('Profil dan kredensial berhasil diperbarui');
    });

    it('harus mengembalikan 400 jika email baru sudah digunakan oleh akun lain', async () => {
      mockAuthUserUpdateError = { code: '23505', message: 'Unique constraint error' };
      const req = new NextRequest('http://localhost/api/profiles/prof-123', {
        method: 'PUT',
        body: JSON.stringify({
          email: 'duplicate@test.com'
        }),
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await PUT(req, { params: Promise.resolve({ id: 'prof-123' }) });
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('Email sudah digunakan');
    });
  });

  describe('DELETE /api/profiles/[id]', () => {
    it('harus mengembalikan 401 jika tidak terautentikasi', async () => {
      const req = new NextRequest('http://localhost/api/profiles/prof-123', {
        method: 'DELETE'
      });
      req.cookies.delete('token');
      const response = await DELETE(req, { params: Promise.resolve({ id: 'prof-123' }) });
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toContain('Sesi habis');
    });

    it('harus mengembalikan 204 jika profil berhasil dihapus', async () => {
      const req = new NextRequest('http://localhost/api/profiles/prof-123', {
        method: 'DELETE',
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await DELETE(req, { params: Promise.resolve({ id: 'prof-123' }) });

      expect(response.status).toBe(204);
    });
  });
});
