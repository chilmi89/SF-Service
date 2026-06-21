import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from './route';
import { NextRequest } from 'next/server';

let mockProfile: any = null;
let deleteCalledTables: string[] = [];

// Mock Supabase
vi.mock('@/lib/supabaseAdmin', () => {
  let tableCalled = '';

  const builder: any = {
    select: vi.fn().mockImplementation(() => builder),
    eq: vi.fn().mockImplementation(() => builder),
    update: vi.fn().mockImplementation(() => builder),
    delete: vi.fn().mockImplementation(() => {
      deleteCalledTables.push(tableCalled);
      return builder;
    }),
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

describe('User Detail API Endpoint (/api/users/[id])', () => {
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
        id: 'usr-123',
        email: 'budi@test.com',
        created_at: '2026-06-21T00:00:00Z'
      },
      roles: {
        id: 'role-123',
        name: 'teknisi'
      }
    };
    deleteCalledTables = [];
  });

  describe('GET /api/users/[id]', () => {
    it('harus mengembalikan detail user 200 jika ditemukan', async () => {
      const req = new NextRequest('http://localhost/api/users/prof-123');
      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.id).toBe('prof-123');
      expect(body.data.email).toBe('budi@test.com');
      expect(body.data.role_name).toBe('teknisi');
    });

    it('harus mengembalikan 404 jika user tidak ditemukan', async () => {
      mockProfile = null;
      const req = new NextRequest('http://localhost/api/users/prof-not-found');
      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toContain('User tidak ditemukan');
    });
  });

  describe('PUT /api/users/[id]', () => {
    it('harus mengembalikan 400 jika role_id tidak disertakan', async () => {
      const req = new NextRequest('http://localhost/api/users/prof-123', {
        method: 'PUT',
        body: JSON.stringify({})
      });
      const response = await PUT(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('Role ID wajib diisi');
    });

    it('harus mengembalikan 200 dan memperbarui role user', async () => {
      const req = new NextRequest('http://localhost/api/users/prof-123', {
        method: 'PUT',
        body: JSON.stringify({ role_id: 'new-role-id' })
      });
      const response = await PUT(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toContain('Role user berhasil diperbarui');
    });
  });

  describe('DELETE /api/users/[id]', () => {
    it('harus menghapus auth_users jika user_id tersedia', async () => {
      const req = new NextRequest('http://localhost/api/users/prof-123', {
        method: 'DELETE'
      });
      const response = await DELETE(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toContain('User berhasil dihapus');
      expect(deleteCalledTables).toContain('auth_users');
    });

    it('harus menghapus profiles langsung jika user_id tidak tersedia', async () => {
      mockProfile.user_id = null;
      const req = new NextRequest('http://localhost/api/users/prof-123', {
        method: 'DELETE'
      });
      const response = await DELETE(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toContain('User berhasil dihapus');
      expect(deleteCalledTables).toContain('profiles');
    });
  });
});
