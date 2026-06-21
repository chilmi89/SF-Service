import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, PUT, DELETE } from './route';
import { NextRequest } from 'next/server';

let mockPermissionsList: any[] = [];
let mockRole: any = null;
let mockAssignedPerms: any[] = [];
let mockNewPermission: any = null;
let mockInsertError: any = null;
let mockUpdateError: any = null;
let deleteCalled = false;

// Mock Supabase
vi.mock('@/lib/supabaseAdmin', () => {
  let tableCalled = '';

  const builder: any = {
    then: vi.fn().mockImplementation((onfulfilled) => {
      if (tableCalled === 'permissions' && mockUpdateError) {
        return Promise.resolve({ error: mockUpdateError }).then(onfulfilled);
      }
      return Promise.resolve({ data: mockPermissionsList, error: null }).then(onfulfilled);
    }),
    select: vi.fn().mockImplementation(() => builder),
    eq: vi.fn().mockImplementation(() => builder),
    order: vi.fn().mockImplementation(() => {
      if (tableCalled === 'permissions') {
        return Promise.resolve({ data: mockPermissionsList, error: null });
      }
      return Promise.resolve({ data: [], error: null });
    }),
    insert: vi.fn().mockImplementation(() => builder),
    upsert: vi.fn().mockImplementation(() => Promise.resolve({ error: null })),
    update: vi.fn().mockImplementation(() => builder),
    delete: vi.fn().mockImplementation(() => {
      deleteCalled = true;
      return builder;
    }),
    single: vi.fn().mockImplementation(() => {
      if (tableCalled === 'roles') {
        return Promise.resolve({ data: mockRole, error: null });
      }
      if (tableCalled === 'permissions') {
        if (mockInsertError) {
          return Promise.resolve({ data: null, error: mockInsertError });
        }
        return Promise.resolve({ data: mockNewPermission, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    })
  };

  return {
    supabaseAdmin: {
      from: vi.fn().mockImplementation((table: string) => {
        tableCalled = table;
        if (table === 'role_permissions') {
          return {
            select: vi.fn().mockImplementation(() => {
              return {
                eq: vi.fn().mockResolvedValue({ data: mockAssignedPerms, error: null })
              };
            }),
            upsert: vi.fn().mockResolvedValue({ error: null })
          };
        }
        return builder;
      })
    }
  };
});

describe('Super Admin Role-Permissions API Endpoint (/api/super-admin/role-permissions)', () => {
  beforeEach(() => {
    mockPermissionsList = [
      { id: 'perm-1', name: 'read_data' },
      { id: 'perm-2', name: 'write_data' }
    ];
    mockRole = { id: 'role-123', name: 'teknisi' };
    mockAssignedPerms = [{ permission_id: 'perm-1' }];
    mockNewPermission = { id: 'perm-new', name: 'download_laporan' };
    mockInsertError = null;
    mockUpdateError = null;
    deleteCalled = false;
  });

  describe('GET /api/super-admin/role-permissions', () => {
    it('harus mengembalikan semua permission jika tanpa filter role_id', async () => {
      const req = new NextRequest('http://localhost/api/super-admin/role-permissions');
      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.permissions).toHaveLength(2);
      expect(body.permissions[0].name).toBe('read_data');
    });

    it('harus mengembalikan role dan status assigned jika role_id disertakan', async () => {
      const req = new NextRequest('http://localhost/api/super-admin/role-permissions?role_id=role-123');
      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.role.name).toBe('teknisi');
      expect(body.permissions).toHaveLength(2);
      // perm-1 should be assigned, perm-2 should be not
      expect(body.permissions.find((p: any) => p.id === 'perm-1').assigned).toBe(true);
      expect(body.permissions.find((p: any) => p.id === 'perm-2').assigned).toBe(false);
    });

    it('harus mengembalikan 404 jika role_id tidak ditemukan', async () => {
      mockRole = null;
      const req = new NextRequest('http://localhost/api/super-admin/role-permissions?role_id=not-exist');
      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toContain('Role tidak ditemukan');
    });
  });

  describe('POST /api/super-admin/role-permissions', () => {
    it('harus mengembalikan 400 jika nama kosong atau format salah', async () => {
      const req = new NextRequest('http://localhost/api/super-admin/role-permissions', {
        method: 'POST',
        body: JSON.stringify({ role_ids: ['role-123'] })
      });
      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('Nama permission wajib diisi');
    });

    it('harus mengembalikan 400 jika minimal satu role_id tidak dipilih', async () => {
      const req = new NextRequest('http://localhost/api/super-admin/role-permissions', {
        method: 'POST',
        body: JSON.stringify({ name: 'test_perm', role_ids: [] })
      });
      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('Minimal pilih satu role');
    });

    it('harus mengembalikan 201 jika pembuatan & assignment permission sukses', async () => {
      const req = new NextRequest('http://localhost/api/super-admin/role-permissions', {
        method: 'POST',
        body: JSON.stringify({ name: 'download_laporan', role_ids: ['role-123'] })
      });
      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.message).toContain('berhasil dibuat dan di-assign');
      expect(body.data.name).toBe('download_laporan');
    });

    it('harus mengembalikan 400 jika permission sudah ada', async () => {
      mockInsertError = { code: '23505', message: 'Unique constraint error' };
      const req = new NextRequest('http://localhost/api/super-admin/role-permissions', {
        method: 'POST',
        body: JSON.stringify({ name: 'download_laporan', role_ids: ['role-123'] })
      });
      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('Permission sudah ada');
    });
  });

  describe('PUT /api/super-admin/role-permissions', () => {
    it('harus mengembalikan 400 jika data tidak lengkap', async () => {
      const req = new NextRequest('http://localhost/api/super-admin/role-permissions', {
        method: 'PUT',
        body: JSON.stringify({ permission_id: '1' })
      });
      const response = await PUT(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('Butuh permission_id dan name');
    });

    it('harus mengembalikan 200 jika nama permission berhasil diupdate', async () => {
      const req = new NextRequest('http://localhost/api/super-admin/role-permissions', {
        method: 'PUT',
        body: JSON.stringify({ permission_id: 'perm-1', name: 'new_name' })
      });
      const response = await PUT(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toContain('berhasil diupdate');
    });

    it('harus mengembalikan 400 jika nama permission baru sudah digunakan', async () => {
      mockUpdateError = { code: '23505', message: 'Unique constraint error' };
      const req = new NextRequest('http://localhost/api/super-admin/role-permissions', {
        method: 'PUT',
        body: JSON.stringify({ permission_id: 'perm-1', name: 'duplicate_name' })
      });
      const response = await PUT(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('Nama permission sudah dipakai');
    });
  });

  describe('DELETE /api/super-admin/role-permissions', () => {
    it('harus mengembalikan 400 jika parameter permission_id tidak diberikan', async () => {
      const req = new NextRequest('http://localhost/api/super-admin/role-permissions');
      const response = await DELETE(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('wajib diisi');
    });

    it('harus mengembalikan 200 jika permission berhasil dihapus', async () => {
      const req = new NextRequest('http://localhost/api/super-admin/role-permissions?permission_id=perm-1');
      const response = await DELETE(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toContain('berhasil dihapus');
      expect(deleteCalled).toBe(true);
    });
  });
});
