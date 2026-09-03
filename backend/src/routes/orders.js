import { Router } from 'express';
import { supabaseForUser } from '../config/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { redis } from '../config/redis.js';

const router = Router();

// Semua route di file ini wajib login — middleware ini jalan duluan
// untuk SETIAP request yang masuk ke router ini.
router.use(requireAuth);

// USER: bikin order baru berikut item-itemnya
router.post('/', requireRole('user'), async (req, res) => {
  // Pakai token milik user yang login (bukan admin key), supaya RLS
  // yang menentukan boleh/tidaknya insert ini — bukan cuma kode Express.
  const db = supabaseForUser(req.userToken);
  const { outletId, pickupAddress, items } = req.body;

  const { data: order, error } = await db
    .from('orders')
    .insert({ user_id: req.user.id, outlet_id: outletId, pickup_address: pickupAddress })
    .select()
    .single(); // .single() supaya hasilnya 1 object, bukan array berisi 1 elemen

  if (error) return res.status(400).json({ error: error.message });

  // Tempelkan order_id ke tiap item sebelum insert ke order_items
  const itemsWithOrderId = items.map((i) => ({ ...i, order_id: order.id }));
  const { error: itemsError } = await db.from('order_items').insert(itemsWithOrderId);
  if (itemsError) return res.status(400).json({ error: itemsError.message });

  res.status(201).json(order);
});

// SEMUA ROLE: lihat daftar order — RLS otomatis membatasi baris mana
// yang kelihatan tergantung siapa yang login (lihat database/rls_policies.sql)
router.get('/', async (req, res) => {
  const db = supabaseForUser(req.userToken);
  const { data, error } = await db.from('orders').select('*, order_items(*)');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// KURIR: update status order yang di-assign ke dia
router.patch('/:id/status', requireRole('kurir'), async (req, res) => {
  const db = supabaseForUser(req.userToken);
  const { status } = req.body;

  const { data, error } = await db
    .from('orders')
    .update({ status })
    .eq('id', req.params.id)
    .eq('kurir_id', req.user.id) // safety ganda, walau RLS sudah cover ini
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  // Hapus cache lama supaya data yang ditampilkan tidak basi (stale)
  if (redis) await redis.del(`orders:outlet:${req.user.outletId}`);

  res.json(data);
});

export default router;
