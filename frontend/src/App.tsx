import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ChatWidget from './components/ChatWidget';

import Login from './pages/Login';
import OrderForm from './pages/user/OrderForm';
import KurirDashboard from './pages/kurir/Dashboard';
import ManagerDashboard from './pages/manager/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';

export default function App() {
  const { session } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* allowedRoles membatasi role mana yang boleh buka halaman ini.
            ProtectedRoute otomatis redirect ke /login kalau belum login,
            atau ke /unauthorized kalau role tidak cocok. */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <OrderForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kurir"
          element={
            <ProtectedRoute allowedRoles={['kurir']}>
              <KurirDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<p>Kamu tidak punya akses ke halaman ini.</p>} />
      </Routes>

      {/* Ditaruh di luar <Routes> supaya widget tetap muncul (floating)
          di halaman manapun, bukan ikut ke-render ulang tiap pindah rute. */}
      {session && <ChatWidget token={session.access_token} />}
    </>
  );
}
