import Redis from 'ioredis';

// Kalau UPSTASH_REDIS_URL belum diisi, redis di-skip supaya server tetap
// bisa jalan untuk development awal tanpa perlu setup Redis dulu.
export const redis = process.env.UPSTASH_REDIS_URL
  ? new Redis(process.env.UPSTASH_REDIS_URL)
  : null;

// Helper pola "cache-aside": cek Redis dulu, kalau kosong jalankan fetchFn
// (query database asli), simpan hasilnya ke Redis dengan masa berlaku (ttl),
// baru dikembalikan ke pemanggil.
export async function cached(key, ttlSeconds, fetchFn) {
  if (!redis) return fetchFn(); // fallback tanpa cache kalau Redis belum disetup

  const hit = await redis.get(key);
  if (hit) return JSON.parse(hit);

  const fresh = await fetchFn();
  await redis.set(key, JSON.stringify(fresh), 'EX', ttlSeconds);
  return fresh;
}
