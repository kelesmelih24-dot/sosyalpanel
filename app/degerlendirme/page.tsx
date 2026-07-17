"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PublicHeader } from "@/components/PublicHeader";

function DegerlendirmeForm() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ discountCode: string | null } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author_name: name, author_email: email || null, comment, rating, order_id: orderId }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "Bir sorun oluştu.");
    setDone({ discountCode: data.discountCode });
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center">
        <div className="text-3xl">🎉</div>
        <h1 className="mt-2 font-display text-xl font-bold text-slate">Teşekkürler!</h1>
        <p className="mt-2 text-sm text-slateMute">Değerlendirmen bize ulaştı.</p>
        {done.discountCode && (
          <div className="mt-4 rounded-xl border border-border2 bg-blush p-4">
            <p className="text-sm text-slateMute">Bir sonraki siparişinde kullanabileceğin indirim kodun:</p>
            <p className="mt-1 font-mono text-lg font-bold text-brand">{done.discountCode}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-16">
      <h1 className="text-center font-display text-2xl font-bold text-slate">Değerlendirme Bırak ⭐</h1>
      <p className="mt-2 text-center text-slateMute">
        Deneyimini bizimle paylaş — ilk değerlendirmende %5 indirim kodu kazanırsın!
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded-2xl border border-border2 bg-paper p-6 shadow-sm">
        <div>
          <label className="mb-1.5 block text-sm text-slateMute">Adın</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-border2 bg-white px-3.5 py-2.5 text-slate focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-slateMute">E-posta (indirim kodu için, opsiyonel)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border2 bg-white px-3.5 py-2.5 text-slate focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-slateMute">Puanın</label>
          <div className="flex gap-1 text-2xl">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} className={n <= rating ? "text-amber-500" : "text-border2"}>
                ★
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-slateMute">Yorumun</label>
          <textarea
            required
            maxLength={1000}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-border2 bg-white px-3.5 py-2.5 text-slate focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] hover:bg-brandDark disabled:opacity-60"
        >
          {loading ? "Gönderiliyor…" : "Gönder"}
        </button>
      </form>
    </div>
  );
}

export default function DegerlendirmePage() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicHeader />
      <Suspense fallback={null}>
        <DegerlendirmeForm />
      </Suspense>
    </div>
  );
}
