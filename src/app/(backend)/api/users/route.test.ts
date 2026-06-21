import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

let mockProfilesList: any[] = [];

// Mock Supabase
vi.mock('@/lib/supabaseAdmin', () => {
  const builder: any = {
    select: vi.fn().mockImplementation(() => {
      return Promise.resolve({ data: mockProfilesList, error: null });
    })
  };
  return {
    supabaseAdmin: {
      from: vi.fn().mockImplementation(() => builder)
    }
  };
});

describe('Users API Endpoint (/api/users)', () => {
  beforeEach(() => {
    mockProfilesList = [
      {
        id: 'user-1',
        full_name: 'Budi Santoso',
        phone: '081234',
        address: 'Malang',
        avatar_url: 'http://avatar.com/1',
        kode_tenant: 'TEN-1',
        auth_users: {
          id: 'user-1',
          email: 'budi@test.com',
          created_at: '2026-06-21T12:00:00Z'
        },
        roles: {
          id: 'role-1',
          name: 'admin tenant'
        }
      }
    ];
  });

  describe('GET /api/users', () => {
    it('harus mengembalikan daftar user yang diratakan (flattened) dengan status 200', async () => {
      const req = new NextRequest('http://localhost/api/users');
      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].id).toBe('user-1');
      expect(body.data[0].full_name).toBe('Budi Santoso');
      expect(body.data[0].email).toBe('budi@test.com');
      expect(body.data[0].role_name).toBe('admin tenant');
    });
  });
});
