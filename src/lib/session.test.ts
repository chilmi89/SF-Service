import { describe, it, expect } from 'vitest';
import { createSessionToken, verifySessionToken } from './session';

describe('Session Utility (JWT)', () => {
  it('should create and verify a valid session token', async () => {
    const payload = { userId: '123', role: 'admin' };
    
    // 1. Buat token
    const token = await createSessionToken(payload);
    expect(token).toBeTypeOf('string');
    expect(token.length).toBeGreaterThan(0);

    // 2. Verifikasi token
    const decoded = await verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded.userId).toBe('123');
    expect(decoded.role).toBe('admin');
  });

  it('should return null for an invalid or tempered token', async () => {
    const invalidToken = 'invalid.jwt.token.string';
    const decoded = await verifySessionToken(invalidToken);
    expect(decoded).toBeNull();
  });
});
