"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BakiyeYuklePage() {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState("havale");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    const res = await fetch("/api/topup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, method, reference_note: note }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Talep oluşturulamadı.");
      return;
    }
    setSuccess("Bakiye yükleme talebin alındı. Onaylandığında bakiyene yansıyacak.");
    setAmount(0);
    setNote("");
    router.refresh();
  }

  return (
    <div className="grid max-w-3xl gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-line bg-panel p-6">
        <h1 className="font-display text-xl font-bold text-ink">Bakiye Yükle</h1>
        <p className="mt-1 text-sm text-mute">Ödemeni yaptıktan sonra aşağıdaki formu doldur, ekibimiz onaylayınca bakiyen anında yansır.</p>

        <div className="mt-5 rounded-lg border border-line bg-void p-4 text-sm text-mute">
          <p className="font-medium text-ink">Havale / EFT bilgileri</p>
          <p className="mt-2">Alıcı: SosyalPanel Ltd. Şti.</p>
          <p>IBAN: TR00 0000 0000 0000 0000 0000 00</p>
          <p>Açıklama: Kullanıcı e-postanı yazmayı unutma.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm text-mute">Tutar (₺)</label>
            <input
              type="number"
              min={1}
              required
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-mute">Yöntem</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
            >
              <option value="havale">Havale / EFT</option>
              <option value="kripto">Kripto</option>
              <option value="diger">Diğer</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-mute">Dekont notu (opsiyonel)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Gönderen ad soyad, saat vb."
              className="w-full rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
            />
          </div>
          {error && <p className="text-sm text-magenta">{error}</p>}
          {success && <p className="text-sm text-emerald-400">{success}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-gradient-to-r from-magenta to-violet px-4 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.02] disabled:opacity-60 focus-ring"
          >
            {submitting ? "Gönderiliyor…" : "Talebi Gönder"}
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-line bg-gradient-to-br from-violet/15 to-cyan/10 p-6 text-sm text-mute">
        <p className="font-display font-semibold text-ink">Nasıl çalışır?</p>
        <ol className="mt-3 flex flex-col gap-2 list-decimal pl-4">
          <li>Ödemeni yukarıdaki IBAN'a veya tercih ettiğin yönteme gönder.</li>
          <li>Bu formu doldurup talebini oluştur.</li>
          <li>Ekibimiz talebini birkaç dakika içinde onaylar.</li>
          <li>Onaylanınca bakiyen anında hesabına yansır ve sipariş verebilirsin.</li>
        </ol>
      </div>
    </div>
  );
}
