import { useState } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };

const API_URL = import.meta.env.VITE_API_URL;

export default function ChatWidget({ token }: { token: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  async function send() {
    if (!input.trim()) return;
    setSending(true);

    const res = await fetch(`${API_URL}/agent/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` // dibaca oleh requireAuth di backend
      },
      body: JSON.stringify({ message: input, history: messages })
    });
    const { reply } = await res.json();

    // Tambahkan pesan user & balasan AI ke riwayat, dalam satu update state
    setMessages((m) => [...m, { role: 'user', content: input }, { role: 'assistant', content: reply }]);
    setInput('');
    setSending(false);
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white shadow-lg rounded-lg border p-3">
      <div className="h-64 overflow-y-auto mb-2 text-sm">
        {messages.map((m, i) => (
          <p key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <span className="font-semibold">{m.role === 'user' ? 'Kamu' : 'AI'}:</span> {m.content}
          </p>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1 text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Tanya sesuatu..."
        />
        <button onClick={send} disabled={sending} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
          Kirim
        </button>
      </div>
    </div>
  );
}
