"use client";

import { useState } from "react";
import { PublicHeader } from "@/components/PublicHeader";

const statusColor: Record<string, string> = {
  awaiting_payment: "text-orange-600",
  pending: "text-amber-600",
  processing: "text-blue-600",
  in_progress: "text-blue-600",
  completed: "text-emerald-600",
  partial: "text-amber-600",
  canceled: "text-slateMute",
  refunded: "text-brand",
};

export default function SiparisSorgulaPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    const res = await fetch("/api/siparis-sorgula", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Sipariş bulunamadı.");
      return;
    }
    setResult(data.order);
  }

  return (
    <div className="min-h-screen bg-paper">
      <PublicHeader />
      <div className="mx-auto max-w-lg px-5 py-16">
        <h1 className="text-center font-display text-2xl font-bold text-slate md:text-3xl">Sipariş Sorgula</h1>
        <p className="mt-2 text-center text-slateMute">
          Üye olmadan da sipariş numaranı ve e-postanı girerek durumunu görebilirsin.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 rounded-2xl border border-border2 bg-paper p-6 shadow-sm">
          <div>
            <label className="mb-1.5 block text-sm text-slateMute">Sipariş Numarası</label>
            <input
              type="text"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="örn. 42"
              className="w-full rounded-lg border border-border2 bg-white px-3.5 py-2.5 text-slate focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slateMute">E-posta</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sipariş verirken kullandığın e-posta"
              className="w-full rounded-lg border border-border2 bg-white px-3.5 py-2.5 text-slate focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] hover:bg-brandDark disabled:opacity-60"
          >
            {loading ? "Sorgulanıyor…" : "Sorgula"}
          </button>
        </form>

        {result && (
          <div className="mt-6 rounded-2xl border border-border2 bg-blush p-6">
            <div className="flex items-center justify-between">
              <span className="font-display font-semibold text-slate">Sipariş #{result.id}</span>
              <span className={`font-semibold ${statusColor[result.status] ?? "text-slateMute"}`}>
                {result.statusLabel}
              </span>
            </div>
            <div className="mt-3 space-y-1 text-sm text-slateMute">
              <p>Hizmet: <span className="text-slate">{result.service}</span></p>
              <p>Miktar: <span className="text-slate">{result.quantity?.toLocaleString("tr-TR")}</span></p>
              {result.startCount != null && <p>Başlangıç sayısı: <span className="text-slate">{result.startCount}</span></p>}
              {result.remains != null && <p>Kalan: <span className="text-slate">{result.remains}</span></p>}
              <p>Tarih: <span className="text-slate">{new Date(result.createdAt).toLocaleDateString("tr-TR")}</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
