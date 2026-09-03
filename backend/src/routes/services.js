import { Router } from 'express';
import { supabaseForUser, supabaseAdmin } from '../config/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { cached, redis } from '../config/redis.js';

const router = Router();
router.use(requireAuth);

// SEMUA ROLE LOGIN: lihat daftar layanan & harga.
// Di-cache karena data ini jarang berubah tapi sering di-query
// (setiap kali user buka form order).
router.get('/', async (req, res) => {
  const db = supabaseForUser(req.userToken);
  const data = await cached(`services:outlet:${req.query.outletId}`, 300, async () => {
    const { data, error } = await db
      .from('services')
      .select('*')
      .eq('outlet_id', req.query.outletId);
    if (error) throw error;
    return data;
  });
  res.json(data);
});

// ADMIN & MANAGER: update harga layanan
router.patch('/:id', requireRole('admin', 'manager'), async (req, res) => {
  const { price_per_kg } = req.body;

  // Pakai supabaseAdmin di sini karena kita sudah cek role lewat requireRole,
  // jadi tidak perlu bergantung ke RLS lagi untuk aksi tulis yang sensitif ini.
  const { data, error } = await supabaseAdmin
    .from('services')
    .update({ price_per_kg, updated_at: new Date() })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  // Invalidate cache supaya harga baru langsung kelihatan
  if (redis) await redis.del(`services:outlet:${data.outlet_id}`);

  res.json(data);
});

export default router;
