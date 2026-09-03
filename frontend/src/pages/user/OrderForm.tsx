import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

type Service = { id: string; name: string; price_per_kg: number };

export default function OrderForm() {
  const { session } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [address, setAddress] = useState('');
  const [weight, setWeight] = useState<number>(1);
  const [selectedService, setSelectedService] = useState('');
  const [message, setMessage] = useState('');

  // Ambil daftar layanan sekali saat halaman dibuka
  useEffect(() => {
    if (!session) return;
    fetch(`${API_URL}/services?outletId=OUTLET_ID_DISINI`, {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })
      .then((res) => res.json())
      .then(setServices);
  }, [session]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({
        outletId: 'OUTLET_ID_DISINI',
        pickupAddress: address,
        items: [{ service_id: selectedService, weight_kg: weight, subtotal: 0 }]
      })
    });
    if (res.ok) setMessage('Order berhasil dibuat!');
    else setMessage('Gagal membuat order.');
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 flex flex-col gap-3">
      <h1 className="text-xl font-bold">Buat Order Laundry</h1>
      {message && <p>{message}</p>}

      <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} className="border rounded px-3 py-2" required>
        <option value="">Pilih layanan</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} — Rp{s.price_per_kg}/kg
          </option>
        ))}
      </select>

      <input
        type="number"
        min={1}
        value={weight}
        onChange={(e) => setWeight(Number(e.target.value))}
        placeholder="Berat (kg)"
        className="border rounded px-3 py-2"
      />

      <textarea
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Alamat penjemputan"
        className="border rounded px-3 py-2"
        required
      />

      <button type="submit" className="bg-blue-600 text-white py-2 rounded">
        Kirim Order
      </button>
    </form>
  );
}
