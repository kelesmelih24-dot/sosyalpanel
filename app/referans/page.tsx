"use client";

import { useState } from "react";
import { PublicHeader } from "@/components/PublicHeader";
import { CopyButton } from "@/components/CopyButton";
import { REFERRAL_DISCOUNT_PERCENT } from "@/lib/constants";

export default function ReferansPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/referans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "Bir sorun oluştu.");
    setLink(data.link);
  }

  return (
    <div className="min-h-screen bg-paper">
      <PublicHeader />
      <div className="mx-auto max-w-lg px-5 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-slate">Arkadaşını Getir 🎁</h1>
        <p className="mt-2 text-slateMute">
          Arkadaşını davet et — o ilk siparişinde %{REFERRAL_DISCOUNT_PERCENT} indirim kazansın,
          siparişi tamamlanınca sen de %{REFERRAL_DISCOUNT_PERCENT} indirim kodu kazan!
        </p>

        {!link ? (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded-2xl border border-border2 bg-white p-6 text-left shadow-sm">
            <div>
              <label className="mb-1.5 block text-sm text-slateMute">E-postan</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border2 bg-white px-3.5 py-2.5 text-slate focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] hover:bg-brandDark disabled:opacity-60"
            >
              {loading ? "Oluşturuluyor…" : "Davet Linkimi Al"}
            </button>
          </form>
        ) : (
          <div className="mt-6 rounded-2xl border border-border2 bg-blush p-6">
            <p className="text-sm text-slateMute">Davet linkin:</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-white px-2 py-1.5 font-mono text-sm text-slate">{link}</code>
              <CopyButton text={link} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
