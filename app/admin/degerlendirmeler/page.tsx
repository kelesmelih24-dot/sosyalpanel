"use client";

import { useEffect, useState } from "react";

type Review = {
  id: number;
  author_name: string;
  comment: string;
  rating: number;
  is_published: boolean;
  created_at: string;
};

export default function AdminDegerlendirmelerPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [form, setForm] = useState({ author_name: "", comment: "", rating: 5, is_published: true });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/reviews");
    const data = await res.json();
    setReviews(data.reviews ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "Değerlendirme eklenemedi.");
    setForm({ author_name: "", comment: "", rating: 5, is_published: true });
    load();
  }

  async function togglePublish(r: Review) {
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: r.id, is_published: !r.is_published }),
    });
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu değerlendirmeyi silmek istediğine emin misin?")) return;
    await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
    load();
  }

  const publishedCount = reviews.filter((r) => r.is_published).length;
  const avgRating = publishedCount
    ? (reviews.filter((r) => r.is_published).reduce((s, r) => s + r.rating, 0) / publishedCount).toFixed(1)
    : "—";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Değerlendirmeler</h1>
        <p className="mt-1 text-mute">
          Sadece buraya gerçek müşteri yorumu ekle — vitrin sitesindeki yıldız puanı ve yorum bölümü
          burada "yayında" işaretlediğin satırlardan otomatik hesaplanır. Hiç eklemezsen sahte bir sayı
          gösterilmez.
        </p>
        <p className="mt-2 text-sm text-cyan">
          Şu an: {publishedCount} yayında değerlendirme, ortalama {avgRating} / 5
        </p>
      </div>

      <form onSubmit={handleCreate} className="flex flex-col gap-3 rounded-xl border border-line bg-panel p-5 max-w-lg">
        <h2 className="font-display font-semibold text-ink">Yeni değerlendirme ekle</h2>
        <input
          required
          placeholder="Müşteri adı"
          value={form.author_name}
          onChange={(e) => setForm({ ...form, author_name: e.target.value })}
          className="rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
        />
        <textarea
          required
          placeholder="Yorum metni"
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
          className="rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
        />
        <div>
          <label className="mb-1 block text-xs text-mute">Puan (1-5)</label>
          <select
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            className="rounded-lg border border-line bg-void px-3 py-2 text-ink focus-ring"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{"★".repeat(n)}{"☆".repeat(5 - n)}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-mute">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
          />
          Hemen yayına al
        </label>
        {error && <p className="text-sm text-magenta">{error}</p>}
        <button
          disabled={loading}
          className="self-start rounded-lg bg-gradient-to-r from-magenta to-violet px-4 py-2 text-sm font-semibold text-ink transition-transform hover:scale-[1.02] disabled:opacity-60 focus-ring"
        >
          {loading ? "Ekleniyor…" : "Değerlendirmeyi Ekle"}
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-line bg-panel">
        <table className="w-full text-left text-sm">
          <thead className="text-mute">
            <tr>
              <th className="px-5 py-3 font-medium">Ad</th>
              <th className="px-5 py-3 font-medium">Yorum</th>
              <th className="px-5 py-3 font-medium">Puan</th>
              <th className="px-5 py-3 font-medium">Durum</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="px-5 py-3 text-ink">{r.author_name}</td>
                <td className="max-w-xs truncate px-5 py-3 text-mute">{r.comment}</td>
                <td className="px-5 py-3 text-amber">{"★".repeat(r.rating)}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => togglePublish(r)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      r.is_published ? "bg-emerald-400/15 text-emerald-400" : "bg-mute/15 text-mute"
                    }`}
                  >
                    {r.is_published ? "Yayında" : "Taslak"}
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => handleDelete(r.id)} className="text-xs text-magenta hover:underline">Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!reviews.length && <p className="px-5 py-6 text-sm text-mute">Henüz değerlendirme eklenmedi.</p>}
      </div>
    </div>
  );
}
