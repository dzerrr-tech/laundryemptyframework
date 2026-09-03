import { supabaseAdmin } from '../config/supabase.js';

// Middleware ini WAJIB dipasang duluan di setiap route yang butuh login.
// Tugasnya: baca token dari header, validasi ke Supabase, lalu tempelkan
// data user (id, role, outlet) ke req supaya bisa dipakai handler berikutnya.
export async function requireAuth(req, res, next) {
  // 1. Ambil token dari header "Authorization: Bearer <token>"
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }
  const token = authHeader.split(' ')[1];

  // 2. Validasi token ke Supabase, dapatkan data user aslinya
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: 'Token tidak valid' });
  }

  // 3. Ambil role & outlet dari tabel profiles (bukan dari token,
  //    karena role bisa berubah setelah token di-generate)
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role, outlet_id')
    .eq('id', user.id)
    .single();

  // 4. Tempel data user + token asli ke req, dipakai route selanjutnya
  req.user = { id: user.id, role: profile?.role, outletId: profile?.outlet_id };
  req.userToken = token;
  next();
}

// Higher-order function: return middleware baru yang cuma meloloskan
// role tertentu. Pemakaian: requireRole('admin', 'manager')
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Tidak punya akses untuk aksi ini' });
    }
    next();
  };
}
