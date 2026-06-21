import { describe, it, expect } from 'vitest';
import { POST } from './route';

describe('POST /api/auth/logout', () => {
  it('harus mengembalikan status 200 dan menghapus cookie token', async () => {
    const response = await POST();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe('Logout berhasil');

    const cookie = response.headers.get('set-cookie');
    expect(cookie).toContain('token=');
    expect(cookie).toContain('Expires=Thu, 01 Jan 1970'); // Menandakan terhapus
  });
});
