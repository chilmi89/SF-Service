import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

let mockProfilesList: any[] = [];
let mockProfileInsert: any = null;

// Mock Supabase
vi.mock('@/lib/supabaseAdmin', () => {
  let tableCalled = '';

  const builder: any = {
    then: vi.fn().mockImplementation((onfulfilled) => {
      return Promise.resolve({ data: mockProfilesList, error: null }).then(onfulfilled);
    }),
    select: vi.fn().mockImplementation(() => builder),
    insert: vi.fn().mockImplementation(() => builder),
    single: vi.fn().mockImplementation(() => {
      return Promise.resolve({ data: mockProfileInsert, error: null });
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

describe('Profiles API Endpoint (/api/profiles)', () => {
  beforeEach(() => {
    mockProfilesList = [
      {
        id: 'prof-123',
        full_name: 'Dewi Sartika',
        phone: '0811',
        address: 'Bandung',
        avatar_url: 'http://avatar/dewi',
        kode_tenant: 'TEN-ABC',
        user_id: 'usr-dewi',
        role_id: 'role-dewi',
        auth_users: {
          email: 'dewi@test.com'
        },
        tenants: {
          name: 'Dewi Salon'
        }
      }
    ];
    mockProfileInsert = {
      id: 'prof-new',
      full_name: 'Rian Prasetyo',
      phone: '0812',
      address: 'Surabaya',
      user_id: 'usr-rian'
    };
  });

  describe('GET /api/profiles', () => {
    it('harus mengembalikan daftar profil yang bersih dengan status 200', async () => {
      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toHaveLength(1);
      
      const profile = body.data[0];
      expect(profile.full_name).toBe('Dewi Sartika');
      expect(profile.email).toBe('dewi@test.com');
      expect(profile.tenant_name).toBe('Dewi Salon');
      
      // Pastikan field rahasia / internal dihapus
      expect(profile.password).toBe('');
      expect(profile.user_id).toBeUndefined();
      expect(profile.role_id).toBeUndefined();
      expect(profile.auth_users).toBeUndefined();
      expect(profile.tenants).toBeUndefined();
    });
  });

  describe('POST /api/profiles', () => {
    it('harus mengembalikan status 400 jika user_id tidak diberikan', async () => {
      const req = new Request('http://localhost/api/profiles', {
        method: 'POST',
        body: JSON.stringify({ full_name: 'Rian' })
      });
      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('user_id wajib diisi');
    });

    it('harus mengembalikan status 201 dan profil baru jika data valid', async () => {
      const req = new Request('http://localhost/api/profiles', {
        method: 'POST',
        body: JSON.stringify({
          user_id: 'usr-rian',
          full_name: 'Rian Prasetyo',
          phone: '0812',
          address: 'Surabaya'
        })
      });
      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.data.id).toBe('prof-new');
      expect(body.data.full_name).toBe('Rian Prasetyo');
    });
  });
});
