"use client";

import { useState } from "react";
import { PublicHeader } from "@/components/PublicHeader";

export default function VeriSilmeTalebiPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!confirmed) return setError("Bu işlemin geri alınamayacağını onaylamalısın.");
    setLoading(true);
    const res = await fetch("/api/veri-silme-talebi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "Bir sorun oluştu.");
    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-paper">
        <PublicHeader />
        <div className="mx-auto max-w-lg px-5 py-16 text-center">
          <div className="text-3xl">✅</div>
          <h1 className="mt-2 font-display text-xl font-bold text-slate">Verilerin silindi</h1>
          <p className="mt-2 text-sm text-slateMute">
            Sipariş kaydından kişisel bilgilerin (e-posta, link, dekont, fatura) kalıcı olarak silindi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <PublicHeader />
      <div className="mx-auto max-w-lg px-5 py-16">
        <h1 className="text-center font-display text-2xl font-bold text-slate">Veri Silme Talebi (KVKK)</h1>
        <p className="mt-2 text-center text-slateMute">
          6698 sayılı KVKK kapsamında, bir siparişine ait kişisel verilerinin kalıcı olarak silinmesini talep edebilirsin.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded-2xl border border-border2 bg-paper p-6 shadow-sm">
          <div>
            <label className="mb-1.5 block text-sm text-slateMute">Sipariş Numarası</label>
            <input
              type="text"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full rounded-lg border border-border2 bg-white px-3.5 py-2.5 text-slate focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slateMute">Sipariş verirken kullandığın e-posta</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border2 bg-white px-3.5 py-2.5 text-slate focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <label className="flex items-start gap-2 text-sm text-slateMute">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5" />
            <span>Bu işlemin <strong>geri alınamayacağını</strong> ve sipariş geçmişimin anonimleştirileceğini anlıyorum.</span>
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {loading ? "Siliniyor…" : "Verilerimi Kalıcı Olarak Sil"}
          </button>
        </form>
      </div>
    </div>
  );
}
