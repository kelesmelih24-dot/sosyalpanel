"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PublicHeader } from "@/components/PublicHeader";
import { CopyButton } from "@/components/CopyButton";
import { BANK_INFO } from "@/lib/constants";
import { extractHandle } from "@/lib/extractHandle";

function DekontYukleForm() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const token = searchParams.get("token");

  const [order, setOrder] = useState<any>(null);
  const [notFoundOrClosed, setNotFoundOrClosed] = useState(false);
  const [dekont, setDekont] = useState<File | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function load() {
      if (!orderId || !token) return;
      const res = await fetch(`/api/guest-orders/dekont?order=${orderId}&token=${token}`);
      if (!res.ok) {
        setNotFoundOrClosed(true);
        return;
      }
      const data = await res.json();
      setOrder(data.order);
    }
    load();
  }, [orderId, token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!confirmed) return setError("Devam etmeden önce açıklama kısmına yazdığını onaylamalısın.");
    if (!dekont) return setError("Ödeme dekontunu (fotoğraf/PDF) seçmen gerekiyor.");
    setLoading(true);
    const fd = new FormData();
    fd.append("order_id", orderId!);
    fd.append("token", token!);
    fd.append("dekont", dekont);
    const res = await fetch("/api/guest-orders/dekont", { method: "POST", body: fd });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "Dekont yüklenemedi.");
    setDone(true);
  }

  if (!orderId || !token) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center text-slateMute">
        Eksik bağlantı. E-postandaki "Dekontu Yükle" linkine tıkladığından emin ol.
      </div>
    );
  }

  if (notFoundOrClosed) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center text-slateMute">
        Bu bağlantı geçersiz, süresi dolmuş ya da bu sipariş için dekont zaten yüklenmiş. Yardım için{" "}
        <a href="/iletisim" className="text-brand hover:underline">iletişim</a> sayfasından bize ulaşabilirsin.
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16">
        <div className="rounded-2xl border border-border2 bg-blush p-6 text-center">
          <div className="text-2xl">✅</div>
          <h1 className="mt-2 font-display text-xl font-bold text-slate">Dekontun alındı</h1>
          <p className="mt-3 text-sm text-slateMute">
            Ekibimiz kısa süre içinde kontrol edip onaylayacak. Durumunu{" "}
            <a href="/siparis-sorgula" className="text-brand hover:underline">Sipariş Sorgula</a> sayfasından
            takip edebilirsin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-16">
      <h1 className="text-center font-display text-2xl font-bold text-slate">Dekont Yükle</h1>
      <p className="mt-2 text-center text-slateMute">
        Ödemeni yaptıysan dekontunu (fotoğraf veya PDF) aşağıdan yükle.
      </p>

      {order && (
        <div className="mt-6 rounded-2xl border border-border2 bg-blush p-4">
          <div className="font-display font-semibold text-slate">Sipariş #{order.id} — {order.services?.name}</div>
          <div className="mt-1 text-sm text-slateMute">Miktar: {order.quantity?.toLocaleString("tr-TR")}</div>
          <div className="mt-2 font-mono font-bold text-brand">Tutar: ₺{Number(order.charge).toFixed(2)}</div>
        </div>
      )}

      <div className="mt-4 rounded-lg border border-border2 bg-white p-4 text-sm text-slateMute">
        <p className="font-medium text-slate">Ödeme bilgileri</p>
        <p className="mt-2">Alıcı: {BANK_INFO.accountName}</p>
        <p>IBAN: {BANK_INFO.iban}</p>
        <p>Banka: {BANK_INFO.bankName}</p>
        {order?.link && (
          <div className="mt-3 rounded-md bg-red-50 p-3">
            <p className="text-red-700">
              ⚠️ <strong>Zorunlu:</strong> Transfer açıklama kısmına hesap kullanıcı adını yazın:
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 rounded bg-white px-2 py-1.5 font-mono text-slate">{extractHandle(order.link)}</code>
              <CopyButton text={extractHandle(order.link)} />
            </div>
            <p className="mt-2 text-xs text-red-700">Açıklama boş bırakılırsa veya farklı yazılırsa ödemeniz eşleştirilemez.</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded-2xl border border-border2 bg-paper p-6 shadow-sm">
        <div>
          <label className="mb-1.5 block text-sm text-slateMute">Ödeme Dekontu (fotoğraf veya PDF)</label>
          <input
            type="file"
            required
            accept="image/*,.pdf"
            onChange={(e) => setDekont(e.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-border2 bg-white px-3.5 py-2.5 text-slate file:mr-3 file:rounded-lg file:border-0 file:bg-brandSoft file:px-3 file:py-1.5 file:text-brand focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <label className="flex items-start gap-2 text-sm text-slateMute">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            Transfer açıklama kısmına {order?.link ? <strong>"{extractHandle(order.link)}"</strong> : "hesap kullanıcı adımı"} yazdığımı onaylıyorum.
          </span>
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || !confirmed}
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] hover:bg-brandDark disabled:opacity-60"
        >
          {loading ? "Yükleniyor…" : "Dekontu Gönder"}
        </button>
      </form>
    </div>
  );
}

export default function DekontYuklePage() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicHeader />
      <Suspense fallback={null}>
        <DekontYukleForm />
      </Suspense>
    </div>
  );
}
