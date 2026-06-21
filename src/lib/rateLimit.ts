import fs from 'fs/promises';
import path from 'path';

const dbPath = path.join(process.cwd(), '.rate-limits.json');

type RateLimitData = {
  [key: string]: number[]; // array of timestamps (milliseconds)
};

async function getDb(): Promise<RateLimitData> {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Return empty object if file doesn't exist
    return {};
  }
}

async function saveDb(data: RateLimitData) {
  try {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving rate limit data:', error);
  }
}

/**
 * Memeriksa dan mencatat batasan (rate limit) untuk suatu aksi.
 * 
 * @param action Nama aksi (contoh: 'create_layanan', 'login')
 * @param identifier ID unik pengguna (contoh: email, user_id, tenant_id)
 * @param maxAttempts Jumlah maksimal aksi yang diizinkan dalam rentang waktu
 * @param windowMs Rentang waktu dalam milidetik
 * @returns true jika diizinkan, false jika melampaui batas
 */
export async function checkRateLimit(
  action: string, 
  identifier: string, 
  maxAttempts: number, 
  windowMs: number,
  recordAttempt: boolean = true
): Promise<{ allowed: boolean; remainingMs: number }> {
  const db = await getDb();
  const key = `${action}_${identifier}`;
  const now = Date.now();
  
  let timestamps = db[key] || [];
  
  // Hapus timestamp yang sudah kadaluarsa dari rentang waktu
  timestamps = timestamps.filter(t => now - t < windowMs);
  
  if (timestamps.length >= maxAttempts) {
    const oldestTimestamp = timestamps[0];
    const timeUntilReset = (oldestTimestamp + windowMs) - now;
    return { allowed: false, remainingMs: timeUntilReset };
  }
  
  if (recordAttempt) {
    timestamps.push(now);
    db[key] = timestamps;
    await saveDb(db);
  }
  
  return { allowed: true, remainingMs: 0 };
}

export async function incrementRateLimit(action: string, identifier: string, windowMs: number) {
  const db = await getDb();
  const key = `${action}_${identifier}`;
  const now = Date.now();
  let timestamps = db[key] || [];
  timestamps = timestamps.filter(t => now - t < windowMs);
  timestamps.push(now);
  db[key] = timestamps;
  await saveDb(db);
}

export async function resetRateLimit(action: string, identifier: string) {
  const db = await getDb();
  const key = `${action}_${identifier}`;
  if (db[key]) {
    delete db[key];
    await saveDb(db);
  }
}
