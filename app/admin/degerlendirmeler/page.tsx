"use client";

import { useEffect, useState } from "react";

type Review = {
  id: number;
  author_name: string;
  author_email: string | null;
  comment: string;
  rating: number;
  is_published: boolean;
  ai_moderation_note: string | null;
  created_at: string;
};

export default function AdminDegerlendirmelerPage() {
  const [reviews, setReviews] = useState<Review[]>([]);

  async function load() {
    const res = await fetch("/api/admin/reviews");
    const data = await res.json();
    setReviews(data.reviews ?? []);
  }

  useEffect(() => {
    load();
  }, []);

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
          Değerlendirmeler <code className="rounded bg-panel2 px-1.5 py-0.5 text-xs">/degerlendirme</code> sayfasından
          müşteriler tarafından bırakılıyor ve AI tarafından otomatik moderasyondan geçip yayınlanıyor.
          Buradan sadece görüntüleyip, uygunsuz olanları silebilirsin.
        </p>
        <p className="mt-2 text-sm text-cyan">
          Şu an: {publishedCount} yayında değerlendirme, ortalama {avgRating} / 5
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-panel">
        <table className="w-full text-left text-sm">
          <thead className="text-mute">
            <tr>
              <th className="px-5 py-3 font-medium">Ad</th>
              <th className="px-5 py-3 font-medium">Yorum</th>
              <th className="px-5 py-3 font-medium">Puan</th>
              <th className="px-5 py-3 font-medium">AI Notu</th>
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
                <td className="px-5 py-3 text-xs text-mute">{r.ai_moderation_note ?? "—"}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      r.is_published ? "bg-emerald-400/15 text-emerald-400" : "bg-mute/15 text-mute"
                    }`}
                  >
                    {r.is_published ? "Yayında" : "Yayında Değil (AI reddetti)"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => handleDelete(r.id)} className="text-xs text-magenta hover:underline">Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!reviews.length && <p className="px-5 py-6 text-sm text-mute">Henüz hiç değerlendirme gelmedi.</p>}
      </div>
    </div>
  );
}
