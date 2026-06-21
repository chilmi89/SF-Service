import { describe, it, expect } from 'vitest';
import { GET } from './route';

describe('Products API Endpoint (/api/products)', () => {
  describe('GET /api/products', () => {
    it('harus mengembalikan status 200 dan daftar produk kosong', async () => {
      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.products).toEqual([]);
    });
  });
});
