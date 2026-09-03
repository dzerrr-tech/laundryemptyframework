import { createClient } from '@supabase/supabase-js';

// Beda dengan backend, frontend pakai ANON_KEY (bukan SERVICE_ROLE_KEY).
// Key ini memang didesain aman dipakai di publik/browser — keamanan
// sebenarnya tetap dijaga oleh RLS policy di database, bukan oleh key ini.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
