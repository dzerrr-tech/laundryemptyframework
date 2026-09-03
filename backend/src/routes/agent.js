import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// "Tool" yang boleh diminta Claude untuk dipanggil. Claude TIDAK menjalankan
// kode ini sendiri — dia cuma mengembalikan "saya mau panggil ini dengan
// input X", eksekusi sebenarnya tetap kita yang kontrol di bawah.
const tools = [
  {
    name: 'update_service_price',
    description: 'Update harga per kg untuk satu layanan laundry di outlet',
    input_schema: {
      type: 'object',
      properties: {
        service_id: { type: 'string' },
        new_price: { type: 'number' }
      },
      required: ['service_id', 'new_price']
    }
  }
];

router.post('/chat', requireAuth, async (req, res) => {
  const { message, history = [] } = req.body;

  // Kasih tahu Claude siapa yang chat, supaya dia tahu boleh/tidak
  // menawarkan fitur ubah harga ke role ini.
  const systemPrompt = `Kamu asisten customer service laundry online.
Jawab pertanyaan seputar layanan, harga, dan status order dengan ramah dan singkat.
Role user yang chat sekarang: ${req.user.role}.
Hanya jika role adalah admin atau manager, kamu boleh memakai tool
update_service_price ketika mereka minta ubah harga. Untuk role lain,
tolak permintaan ubah harga dan arahkan hubungi admin.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system: systemPrompt,
    messages: [...history, { role: 'user', content: message }],
    tools
  });

  // Cek apakah Claude minta memanggil tool (bukan cuma jawab teks biasa)
  const toolUse = response.content.find((block) => block.type === 'tool_use');

  if (toolUse?.name === 'update_service_price') {
    // GARIS PERTAHANAN UTAMA: backend cek ulang role secara independen,
    // TIDAK cuma percaya instruksi di system prompt. AI bisa saja salah
    // atau dimanipulasi lewat prompt injection dari isi chat user.
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.json({ reply: 'Maaf, kamu tidak punya izin mengubah harga.' });
    }

    const { service_id, new_price } = toolUse.input;
    const { error } = await supabaseAdmin
      .from('services')
      .update({ price_per_kg: new_price, updated_at: new Date() })
      .eq('id', service_id);

    if (error) return res.json({ reply: `Gagal update harga: ${error.message}` });
    return res.json({ reply: `Harga berhasil diupdate ke Rp${new_price}/kg.` });
  }

  // Kalau bukan tool call, ambil blok teks jawabannya
  const textBlock = response.content.find((block) => block.type === 'text');
  res.json({ reply: textBlock?.text ?? 'Maaf, saya tidak mengerti.' });
});

export default router;
