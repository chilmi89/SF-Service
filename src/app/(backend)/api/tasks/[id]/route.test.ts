import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT, DELETE } from './route';
import { NextRequest } from 'next/server';

let mockTask: any = null;
let mockSession: any = null;
let mockOrdersUpdated = false;

// 1. Mock Supabase
vi.mock('@/lib/supabaseAdmin', () => {
  return {
    supabaseAdmin: {
      from: vi.fn().mockImplementation((table: string) => {
        return {
          update: vi.fn().mockImplementation((payload: any) => {
            return {
              eq: vi.fn().mockImplementation((col: string, val: string) => {
                if (table === 'orders' && val === 'ord-123') {
                  mockOrdersUpdated = true;
                }
                return {
                  select: vi.fn().mockReturnThis(),
                  single: vi.fn().mockImplementation(() => {
                    if (table === 'tasks') {
                      return { data: { ...mockTask, ...payload }, error: null };
                    }
                    return { data: null, error: null };
                  })
                };
              })
            };
          }),
          delete: vi.fn().mockImplementation(() => {
            return {
              eq: vi.fn().mockResolvedValue({ error: null })
            };
          })
        };
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

describe('Tasks Detail API Endpoint (/api/tasks/[id])', () => {
  beforeEach(() => {
    mockSession = { userId: 'usr-123', role: 'teknisi' };
    mockTask = { id: 'task-123', order_id: 'ord-123', technician_id: 'prof-123', status_tugas: '2' };
    mockOrdersUpdated = false;
  });

  describe('PUT /api/tasks/[id]', () => {
    it('harus mengembalikan 401 jika user belum login', async () => {
      mockSession = null;
      const req = new NextRequest('http://localhost/api/tasks/task-123', { method: 'PUT', body: JSON.stringify({ status_tugas: '3' }) });
      const response = await PUT(req, { params: Promise.resolve({ id: 'task-123' }) });
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe('Tidak sah');
    });

    it('harus mengembalikan 403 jika role user bukan teknisi/owner/admin (misal customer biasa)', async () => {
      mockSession.role = 'customer';
      const req = new NextRequest('http://localhost/api/tasks/task-123', {
        method: 'PUT',
        body: JSON.stringify({ status_tugas: '3' }),
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await PUT(req, { params: Promise.resolve({ id: 'task-123' }) });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain('Hanya Teknisi atau Owner');
    });

    it('harus mengembalikan 200 dan mengupdate status tugas', async () => {
      const req = new NextRequest('http://localhost/api/tasks/task-123', {
        method: 'PUT',
        body: JSON.stringify({ status_tugas: '3' }),
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await PUT(req, { params: Promise.resolve({ id: 'task-123' }) });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('Status tugas berhasil diperbarui');
      expect(body.data.status_tugas).toBe('3');
    });

    it('harus otomatis mengupdate status order menjadi 7 (menunggu pembayaran) jika task selesai ("selesai" atau "4")', async () => {
      const req = new NextRequest('http://localhost/api/tasks/task-123', {
        method: 'PUT',
        body: JSON.stringify({ status_tugas: 'selesai' }),
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await PUT(req, { params: Promise.resolve({ id: 'task-123' }) });
      
      expect(response.status).toBe(200);
      expect(mockOrdersUpdated).toBe(true); // Order database update terpanggil!
    });
  });

  describe('DELETE /api/tasks/[id]', () => {
    it('harus mengembalikan 403 jika teknisi (bukan owner) mencoba menghapus tugas', async () => {
      mockSession.role = 'teknisi';
      const req = new NextRequest('http://localhost/api/tasks/task-123', {
        method: 'DELETE',
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await DELETE(req, { params: Promise.resolve({ id: 'task-123' }) });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain('Hanya Owner atau Admin');
    });

    it('harus mengembalikan 204 jika owner sukses menghapus tugas', async () => {
      mockSession.role = 'owner';
      const req = new NextRequest('http://localhost/api/tasks/task-123', {
        method: 'DELETE',
        headers: { 'cookie': 'token=validToken' }
      });
      const response = await DELETE(req, { params: Promise.resolve({ id: 'task-123' }) });

      expect(response.status).toBe(204);
    });
  });
});
