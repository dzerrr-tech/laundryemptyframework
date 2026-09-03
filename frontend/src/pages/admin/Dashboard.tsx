import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminDashboard() {
  const { session } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!session) return;
    // Sebagai admin, RLS mengizinkan lihat SEMUA order lintas outlet
    fetch(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })
      .then((res) => res.json())
      .then(setOrders);
  }, [session]);

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-xl font-bold mb-4">Dashboard Admin — Semua Order</h1>
      <p className="text-sm text-gray-500 mb-2">Total order: {orders.length}</p>
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
