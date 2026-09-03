import rateLimit from 'express-rate-limit';

// Limit umum untuk semua endpoint: 100 request / 15 menit per IP.
// windowMs = jendela waktu (dalam milidetik), max = batas request dalam jendela itu.
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Terlalu banyak request, coba lagi nanti' }
});

// Limit lebih ketat khusus endpoint sensitif seperti login/chat AI,
// karena ini target favorit serangan brute-force / abuse biaya API.
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Terlalu banyak percobaan, tunggu beberapa menit' }
});
