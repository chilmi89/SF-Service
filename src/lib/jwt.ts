import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_please_change_this_in_production'
);

/**
 * Membuat Token JWT untuk user.
 */
export async function signJWT(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // Token berlaku selama 24 jam
    .sign(secret);
}

/**
 * Memvalidasi Token JWT.
 */
export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null; // Token tidak valid atau kadaluarsa
  }
}
