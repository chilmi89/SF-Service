import { describe, it, expect } from 'vitest';
import { GET } from './route';

describe('Analytics API Endpoint (/api/analytics)', () => {
  describe('GET /api/analytics', () => {
    it('harus mengembalikan status 200 dan stats kosong', async () => {
      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.stats).toEqual({});
    });
  });
});
