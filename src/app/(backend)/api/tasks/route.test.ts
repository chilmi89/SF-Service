import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

let mockProfile: any = null;
let mockTenant: any = null;
let mockTasksList: any[] = [];
let mockTaskInsertResult: any = null;
let mockSession: any = null;

// 1. Mock Supabase
vi.mock('@/lib/supabaseAdmin', () => {
  const buildChain = (table: string) => {
    const builder: any = {
      select: vi.fn().mockImplementation(() => builder),
      eq: vi.fn().mockImplementation(() => builder),
      neq: vi.fn().mockImplementation(() => builder),
      order: vi.fn().mockImplementation(() => builder),
      limit: vi.fn().mockImplementation(() => builder),
      insert: vi.fn().mockImplementation(() => builder),
      delete: vi.fn().mockImplementation(() => builder),
      single: vi.fn().mockImplementation(() => {
        if (table === 'profiles') {
          return Promise.resolve({ data: mockProfile, error: null });
        }
        if (table === 'tenants') {
          return Promise.resolve({ data: mockTenant, error: null });
        }
        if (table === 'tasks') {
          return Promise.resolve({ data: mockTaskInsertResult, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      }),
      maybeSingle: vi.fn().mockImplementation(() => {
        return Promise.resolve({ data: null, error: null });
      }),
      then: vi.fn().mockImplementation((callback: any) => {
        return Promise.resolve(callback({ data: mockTasksList, error: null }));
      })
    };
    return builder;
  };

  return {
    supabaseAdmin: {
      from: vi.fn().mockImplementation((table: string) => {
        return buildChain(table);
      })
    }
  };
});

// 2. Mock Session verifySessionToken
vi.mock('@/lib/session', () => ({
  verifySessionToken: vi.fn().mockImplementation(() => {
    return Promise.resolve(mockSession);
  })
}));

describe('Tasks API Endpoint (/api/tasks)', () => {
  beforeEach(() => {
    mockSession = { userId: 'usr-123', role: 'teknisi' };
    mockProfile = { id: 'prof-123', kode_tenant: 'TEN-123' };
    mockTenant = { id: 'tenant-123' };
    mockTaskInsertResult = { id: 'task-123', order_id: 'ord-123', technician_id: 'prof-123', deskripsi: 'Periksa Kulkas' };
    mockTasksList = [
      { id: 'task-123', technician_id: 'prof-123', deskripsi: 'Periksa Kulkas' }
    ];
  });

  describe('GET /api/tasks', () => {
    it('harus mengembalikan 401 jika user belum login', async () => {
      mockSession = null;
      const req = new NextRequest('http://localhost/api/tasks');
      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe('Tidak sah');
    });

    it('harus mengembalikan daftar tugas untuk teknisi dengan status 200', async () => {
      const req = new NextRequest('http://localhost/api/tasks', {
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].deskripsi).toBe('Periksa Kulkas');
    });
  });

  describe('POST /api/tasks', () => {
    it('harus mengembalikan 403 jika role user bukan owner atau admin', async () => {
      mockSession.role = 'teknisi'; // Teknisi tidak boleh assign task
      const req = new NextRequest('http://localhost/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ order_id: 'ord-123', deskripsi: 'Service AC' }),
        headers: { 'cookie': 'token=validToken' }
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain('Hanya Owner atau Admin');
    });

    it('harus mengembalikan 400 jika order_id atau deskripsi kosong', async () => {
      mockSession.role = 'owner';
      const req = new NextRequest('http://localhost/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ order_id: '', deskripsi: '' }),
        headers: { 'cookie': 'token=validToken' }
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('wajib diisi');
    });

    it('harus mengembalikan 201 jika task berhasil dibuat', async () => {
      mockSession.role = 'owner';
      const req = new NextRequest('http://localhost/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ order_id: 'ord-123', deskripsi: 'Periksa Kulkas', technician_id: 'prof-123' }),
        headers: { 'cookie': 'token=validToken' }
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.message).toBe('Tugas berhasil dibuat');
      expect(body.data.id).toBe('task-123');
    });
  });
});
