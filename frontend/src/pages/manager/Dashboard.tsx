import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

export default function ManagerDashboard() {
  const { session } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!session) return;
    // RLS otomatis membatasi hasil ini cuma order di outlet manager ini —
    // tidak perlu filter outlet_id manual di frontend/backend.
    fetch(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })
      .then((res) => res.json())
      .then(setOrders);
  }, [session]);

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-xl font-bold mb-4">Dashboard Manager — Order Outlet</h1>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Alamat</th>
            <th>Status</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o: any) => (
            <tr key={o.id} className="border-b">
              <td className="py-2">{o.pickup_address}</td>
              <td>{o.status}</td>
              <td>Rp{o.total_price ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
