import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

type Order = { id: string; status: string; pickup_address: string };

export default function KurirDashboard() {
  const { session } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  // Fungsi dipisah dari useEffect supaya bisa dipanggil ulang setelah update status
  async function loadOrders() {
    const res = await fetch(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${session?.access_token}` }
    });
    setOrders(await res.json());
  }

  useEffect(() => {
    if (session) loadOrders();
  }, [session]);

  async function updateStatus(orderId: string, status: string) {
    await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({ status })
    });
    loadOrders(); // refresh daftar setelah update, bukan reload halaman
  }

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-xl font-bold mb-4">Order Assignment Saya</h1>
      {orders.map((o) => (
        <div key={o.id} className="border rounded p-3 mb-2">
          <p>{o.pickup_address}</p>
          <p className="text-sm text-gray-500">Status: {o.status}</p>
          <select
            value={o.status}
            onChange={(e) => updateStatus(o.id, e.target.value)}
            className="border rounded px-2 py-1 mt-2"
          >
            <option value="dijemput_kurir">Dijemput</option>
            <option value="diproses_outlet">Diproses Outlet</option>
            <option value="siap_antar">Siap Antar</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>
      ))}
    </div>
  );
}
