import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

type AuthContextType = {
  session: Session | null;
  role: string | null;
  loading: boolean;
};

// Context React, dipakai supaya session & role bisa diakses dari komponen
// manapun tanpa perlu "prop drilling" (oper props berlapis-lapis).
const AuthContext = createContext<AuthContextType>({ session: null, role: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Effect 1: sinkronkan session dengan status login Supabase.
  useEffect(() => {
    // Ambil session yang tersimpan (kalau user sebelumnya sudah login)
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Berlangganan event: tiap kali login/logout/token refresh, state ikut update
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });

    // Cleanup: berhenti berlangganan saat komponen unmount, cegah memory leak
    return () => sub.subscription.unsubscribe();
  }, []);

  // Effect 2: setelah session ada, ambil role dari tabel profiles.
  // Dipisah dari effect 1 karena bergantung pada session (dependency [session]).
  useEffect(() => {
    if (!session) {
      setRole(null);
      return;
    }
    supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setRole(data?.role ?? null));
  }, [session]);

  return (
    <AuthContext.Provider value={{ session, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook supaya pemakaiannya cukup `const { session, role } = useAuth()`
export const useAuth = () => useContext(AuthContext);
