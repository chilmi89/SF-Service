import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

// 1. Mock supabaseAdmin agar tidak melakukan query asli ke cloud Supabase
vi.mock('@/lib/supabaseAdmin', () => {
  return {
    supabaseAdmin: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockImplementation(() => {
        // Simulasi data kategori tiruan
        return Promise.resolve({
          data: [
            { id: 1, nama_kategori: 'Service AC' },
            { id: 2, nama_kategori: 'Service Kulkas' }
          ],
          error: null
        });
      })
    }
  };
});

describe('GET /api/kategori', () => {
  it('harus mengembalikan daftar kategori dengan status 200', async () => {
    // 2. Buat objek NextRequest tiruan
    const req = new NextRequest('http://localhost/api/kategori');

    // 3. Jalankan fungsi GET handler dari route.ts
    const response = await GET(req);
    const body = await response.json();

    // 4. Verifikasi status respon dan isi data
    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data).toHaveLength(2);
    expect(body.data[0].nama_kategori).toBe('Service AC');
    expect(body.data[1].nama_kategori).toBe('Service Kulkas');
  });
});
