"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PublicHeader } from "@/components/PublicHeader";
import { createClient } from "@/lib/supabase/client";

type Service = {
  id: number;
  name: string;
  min_quantity: number;
  max_quantity: number;
  price_per_1000: number;
};

function MisafirSiparisForm() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("service");

  const [service, setService] = useState<Service | null>(null);
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState("havale");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    async function load() {
      if (!serviceId) return;
      const { data } = await supabase
        .from("services")
        .select("id, name, min_quantity, max_quantity, price_per_1000")
        .eq("id", serviceId)
        .single();
      setService(data);
    }
    load();
  }, [serviceId]);

  const charge = service ? (quantity / 1000) * Number(service.price_per_1000) : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!service) return;
    if (quantity < service.min_quantity || quantity > service.max_quantity) {
      return setError(`Miktar ${service.min_quantity} ile ${service.max_quantity} arasında olmalı.`);
    }
    setLoading(true);
    const res = await fetch("/api/guest-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service_id: service.id, link, quantity, guest_email: email, payment_method: method }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Sipariş oluşturulamadı.");
      return;
    }
    setResult(data.order);
  }

  if (!serviceId) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center text-slateMute">
        Bir hizmet seçilmedi. Lütfen{" "}
        <a href="/" className="text-brand hover:underline">hizmetler sayfasından</a> bir paket seç.
      </div>
    );
  }

  if (result) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16">
        <div className="rounded-2xl border border-border2 bg-blush p-6 text-center">
          <div className="text-2xl">✅</div>
          <h1 className="mt-2 font-display text-xl font-bold text-slate">Sipariş talebin alındı</h1>
          <p className="mt-2 text-sm text-slateMute">
            Sipariş numaran: <span className="font-mono font-bold text-brand">#{result.id}</span>
          </p>
          <p className="mt-3 text-sm text-slateMute">
            Ödemeni aşağıdaki bilgilerle yaptıktan sonra ekibimiz onaylayacak ve siparişin işleme girecek.
            Durumunu dilediğin zaman{" "}
            <a href="/siparis-sorgula" className="text-brand hover:underline">Sipariş Sorgula</a> sayfasından,
            sipariş numaranı ve e-postanı girerek takip edebilirsin.
          </p>
          <div className="mt-4 rounded-lg border border-border2 bg-white p-4 text-left text-sm text-slateMute">
            <p className="font-medium text-slate">Havale / EFT bilgileri</p>
            <p className="mt-2">Alıcı: SosyalPanel Ltd. Şti.</p>
            <p>IBAN: TR00 0000 0000 0000 0000 0000 00</p>
            <p>Açıklama: Sipariş #{result.id} yazmayı unutma.</p>
            <p className="mt-2 font-mono font-bold text-brand">Tutar: ₺{Number(result.charge).toFixed(2)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-16">
      <h1 className="text-center font-display text-2xl font-bold text-slate">Üye Olmadan Sipariş Ver</h1>
      <p className="mt-2 text-center text-slateMute">
        Hesap oluşturmadan sipariş verebilirsin. Ödemeni yaptıktan sonra ekibimiz onaylayıp işleme alacak.
      </p>

      {service && (
        <div className="mt-6 rounded-2xl border border-border2 bg-blush p-4">
          <div className="font-display font-semibold text-slate">{service.name}</div>
          <div className="mt-1 text-sm text-slateMute">
            Min {service.min_quantity.toLocaleString("tr-TR")} — Maks {service.max_quantity.toLocaleString("tr-TR")}
            {" · "}₺{Number(service.price_per_1000).toFixed(2)} / 1000
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded-2xl border border-border2 bg-paper p-6 shadow-sm">
        <div>
          <label className="mb-1.5 block text-sm text-slateMute">Hedef Link</label>
          <input
            type="url"
            required
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://instagram.com/kullaniciadi"
            className="w-full rounded-lg border border-border2 bg-white px-3.5 py-2.5 text-slate focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-slateMute">Miktar</label>
          <input
            type="number"
            required
            value={quantity || ""}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full rounded-lg border border-border2 bg-white px-3.5 py-2.5 text-slate focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-slateMute">E-posta (sipariş takibi için gerekli)</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border2 bg-white px-3.5 py-2.5 text-slate focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-slateMute">Ödeme Yöntemi</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full rounded-lg border border-border2 bg-white px-3.5 py-2.5 text-slate focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="havale">Havale / EFT</option>
            <option value="kripto">Kripto</option>
          </select>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border2 bg-blush px-4 py-3">
          <span className="text-sm text-slateMute">Toplam Tutar</span>
          <span className="font-mono text-lg font-bold text-brand">₺{charge.toFixed(2)}</span>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || !service}
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] hover:bg-brandDark disabled:opacity-60"
        >
          {loading ? "Gönderiliyor…" : "Sipariş Talebini Gönder"}
        </button>

        <p className="text-center text-xs text-slateMute">
          Bakiye biriktirip daha hızlı sipariş vermek ister misin?{" "}
          <a href="/kayit" className="text-brand hover:underline">Ücretsiz üye ol</a>
        </p>
      </form>
    </div>
  );
}

export default function MisafirSiparisPage() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicHeader />
      <Suspense fallback={null}>
        <MisafirSiparisForm />
      </Suspense>
    </div>
  );
}
