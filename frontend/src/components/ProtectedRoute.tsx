import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Props = {
  allowedRoles?: string[]; // kalau tidak diisi, berarti cukup "sudah login" saja
  children: ReactNode;
};

// Komponen pembungkus: bungkus halaman yang butuh proteksi dengan ini.
// Ini proteksi di sisi TAMPILAN saja — proteksi data sebenarnya tetap
// di RLS (database) dan requireRole (backend), karena proteksi frontend
// selalu bisa dilewati orang yang paham DevTools.
export default function ProtectedRoute({ allowedRoles, children }: Props) {
  const { session, role, loading } = useAuth();

  if (loading) return <p>Memuat...</p>;
  if (!session) return <Navigate to="/login" replace />;
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
