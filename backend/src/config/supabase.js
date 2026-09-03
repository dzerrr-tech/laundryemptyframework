import { createClient } from '@supabase/supabase-js';

// Client "admin" pakai service_role key — dipakai backend untuk operasi
// yang perlu bypass RLS (misal validasi token, baca profile lintas-user).
// JANGAN PERNAH kirim service_role key ini ke frontend.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Fungsi ini bikin client "atas nama user" — dengan token JWT milik user itu,
// sehingga RLS policy tetap berlaku sesuai role user yang sedang request.
// Dipakai di hampir semua route supaya keamanan diserahkan ke database (RLS),
// bukan dicek manual berulang-ulang di kode Express.
export function supabaseForUser(userJwt) {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${userJwt}` } }
  });
}
