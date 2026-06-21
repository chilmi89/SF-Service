import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

let mockRolesList: any[] = [];

// Mock Supabase
vi.mock('@/lib/supabaseAdmin', () => {
  const builder: any = {
    select: vi.fn().mockImplementation(() => builder),
    order: vi.fn().mockImplementation(() => {
      return Promise.resolve({ data: mockRolesList, error: null });
    })
  };
  return {
    supabaseAdmin: {
      from: vi.fn().mockImplementation(() => builder)
    }
  };
});

describe('Super Admin Roles API Endpoint (/api/super-admin/roles)', () => {
  beforeEach(() => {
    mockRolesList = [
      { id: '1', name: 'admin tenant' },
      { id: '2', name: 'super admin' },
      { id: '3', name: 'teknisi' }
    ];
  });

  describe('GET /api/super-admin/roles', () => {
    it('harus mengembalikan semua role yang diurutkan dengan status 200', async () => {
      const req = new NextRequest('http://localhost/api/super-admin/roles');
      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toHaveLength(3);
      expect(body.data[0].name).toBe('admin tenant');
      expect(body.data[1].name).toBe('super admin');
      expect(body.data[2].name).toBe('teknisi');
    });
  });
});
