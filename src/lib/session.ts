import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'fallback_secret_please_change_this_in_production'
);

/**
 * Membuat Token Sesi (Payload) untuk disimpan di dalam HttpOnly Cookie.
 * Sistem menggunakan 'jose' untuk enkripsi yang aman dan stateless.
 */
export async function createSessionToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // Sesi berlaku selama 24 jam
    .sign(secret);
}

/**
 * Memvalidasi Token Sesi dari Cookie.
 */
export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null; // Sesi tidak valid atau kadaluarsa
  }
}
