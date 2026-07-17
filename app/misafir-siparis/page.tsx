"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PublicHeader } from "@/components/PublicHeader";
import { CopyButton } from "@/components/CopyButton";
import { createClient } from "@/lib/supabase/client";
import { BANK_INFO, MIN_ORDER_AMOUNT, BULK_DISCOUNT_THRESHOLD, BULK_DISCOUNT_PERCENT } from "@/lib/constants";
import { extractHandle } from "@/lib/extractHandle";

type Service = {
  id: number;
  name: string;
  min_quantity: number;
  max_quantity: number;
  price_per_1000: number;
};

function MisafirSiparisForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("service");
  const prefilledQuantity = searchParams.get("quantity");

  const [service, setService] = useState<Service | null>(null);
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState<number>(prefilledQuantity ? Number(prefilledQuantity) : 0);
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState("havale");
  const [couponCode, setCouponCode] = useState("");
  const [agreed, setAgreed] = useState(false);
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

  const baseCharge = service ? (quantity / 1000) * Number(service.price_per_1000) : 0;
  const bulkEligible = quantity >= BULK_DISCOUNT_THRESHOLD;
  const bulkDiscount = bulkEligible ? baseCharge * (BULK_DISCOUNT_PERCENT / 100) : 0;
  const estimatedCharge = Math.max(0, baseCharge - bulkDiscount);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!service) return;
    if (quantity < service.min_quantity || quantity > service.max_quantity) {
      return setError(`Miktar ${service.min_quantity} ile ${service.max_quantity} arasında olmalı.`);
    }
    if (baseCharge < MIN_ORDER_AMOUNT) {
      return setError(`Minimum sipariş tutarı ₺${MIN_ORDER_AMOUNT}. Miktarı artırman gerekiyor.`);
    }
    if (!agreed) {
      return setError("Devam etmek için Mesafeli Satış Sözleşmesi'ni ve Ön Bilgilendirme Formu'nu kabul etmelisin.");
    }
    setLoading(true);
    const res = await fetch("/api/guest-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: service.id,
        link,
        quantity,
        guest_email: email,
        payment_method: method,
        coupon_code: couponCode || undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Sipariş oluşturulamadı.");
      return;
    }
    setResult(data);
  }

  if (!serviceId) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center text-slateMute">
        Bir hizmet seçilmedi. Lütfen{" "}
        <a href="/#hizmetler" className="text-brand hover:underline">hizmetler sayfasından</a> bir paket seç.
      </div>
    );
  }

  if (result) {
    const o = result.order;
    const totalDiscount = Number(o.discount_amount ?? 0) + Number(o.bulk_discount_amount ?? 0);
    return (
      <div className="mx-auto max-w-lg px-5 py-16">
        <div className="rounded-2xl border border-border2 bg-blush p-6 text-center">
          <div className="text-2xl">✅</div>
          <h1 className="mt-2 font-display text-xl font-bold text-slate">Siparişin oluşturuldu 🎉</h1>
          <p className="mt-2 text-sm text-slateMute">
            Sipariş numaran: <span className="font-mono font-bold text-brand">#{o.id}</span>
          </p>
          <p className="mt-3 text-sm text-slateMute">
            Ödeme bilgilerini ve dekont yükleme linkini <strong>{email}</strong> adresine gönderdik.
            E-postan gelmezse aşağıdaki bilgilerle ödemeni yapıp direkt buradan da dekontunu yükleyebilirsin.
          </p>

          <div className="mt-4 rounded-lg border border-border2 bg-white p-4 text-left text-sm text-slateMute">
            <p className="font-medium text-slate">Ödeme bilgileri</p>
            <p className="mt-2">Alıcı: {BANK_INFO.accountName}</p>
            <p>IBAN: {BANK_INFO.iban}</p>
            <p>Banka: {BANK_INFO.bankName}</p>
            {totalDiscount > 0 && (
              <p className="mt-2 text-emerald-600">
                🎁 {o.discount_code ? `"${o.discount_code}" kodu` : "İndirim"} uygulandı: −₺{totalDiscount.toFixed(2)}
              </p>
            )}
            <p className="mt-2 font-mono font-bold text-brand">Ödenecek Tutar: ₺{Number(o.charge).toFixed(2)}</p>
            <div className="mt-3 rounded-md bg-red-50 p-3">
              <p className="text-red-700">
                ⚠️ <strong>Zorunlu:</strong> Transfer açıklama kısmına hesap kullanıcı adını yazın:
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 rounded bg-white px-2 py-1.5 font-mono text-slate">{extractHandle(link)}</code>
                <CopyButton text={extractHandle(link)} />
              </div>
              <p className="mt-2 text-xs text-red-700">Açıklama boş bırakılırsa veya farklı yazılırsa ödemeniz eşleştirilemez.</p>
            </div>
          </div>

          <p className="mt-3 text-xs text-slateMute">
            ⏰ Bu sipariş için 24 saat içinde dekont yüklenmezse otomatik iptal edilir.
          </p>

          <button
            onClick={() => router.push(result.uploadPath)}
            className="mt-5 w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] hover:bg-brandDark"
          >
            Ödemeyi Yaptım, Dekontu Yükle 🚀
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-16">
      <h1 className="text-center font-display text-2xl font-bold text-slate">Sipariş Ver 🛒</h1>
      <p className="mt-2 text-center text-slateMute">
        Üye olmana gerek yok! Sipariş bilgilerini gir, ödeme bilgilerini ve dekont yükleme linkini
        e-postana göndereceğiz.
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
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm text-slateMute">Miktar</label>
            {prefilledQuantity && (
              <button type="button" onClick={() => router.back()} className="text-xs text-brand hover:underline">
                Değiştir
              </button>
            )}
          </div>
          <input
            type="number"
            required
            readOnly={!!prefilledQuantity}
            value={quantity || ""}
            onChange={(e) => !prefilledQuantity && setQuantity(Number(e.target.value))}
            className={`w-full rounded-lg border border-border2 px-3.5 py-2.5 text-slate focus:outline-none focus:ring-2 focus:ring-brand ${
              prefilledQuantity ? "bg-blush" : "bg-white"
            }`}
          />
          {bulkEligible && (
            <p className="mt-1.5 text-xs font-medium text-emerald-600">
              🎉 {BULK_DISCOUNT_THRESHOLD.toLocaleString("tr-TR")}+ adet siparişte otomatik %{BULK_DISCOUNT_PERCENT} indirim uygulanıyor!
            </p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-slateMute">E-posta (ödeme bilgileri buraya gönderilecek)</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border2 bg-white px-3.5 py-2.5 text-slate focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-slateMute">Kupon Kodu (varsa)</label>
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="örn. YORUM5X7K2"
            className="w-full rounded-lg border border-border2 bg-white px-3.5 py-2.5 text-slate focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <p className="mt-1 text-xs text-slateMute">Kuponun yoksa boş bırak — ilk siparişinde otomatik %10 indirim uygulanır. ✨</p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-slateMute">Ödeme Yöntemi</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full rounded-lg border border-border2 bg-white px-3.5 py-2.5 text-slate focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="havale">Havale / EFT</option>
            <option value="kripto" disabled>Kripto (çok yakında)</option>
            <option value="kart" disabled>💳 Kredi Kartı (çok yakında)</option>
          </select>
        </div>

        <div className="rounded-lg border border-border2 bg-blush px-4 py-3">
          <div className="flex items-center justify-between text-sm text-slateMute">
            <span>Ara Toplam</span>
            <span>₺{baseCharge.toFixed(2)}</span>
          </div>
          {bulkDiscount > 0 && (
            <div className="mt-1 flex items-center justify-between text-sm text-emerald-600">
              <span>Toplu alım indirimi (−%{BULK_DISCOUNT_PERCENT})</span>
              <span>−₺{bulkDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between border-t border-border2 pt-2">
            <span className="text-sm font-medium text-slate">Tahmini Toplam*</span>
            <span className="font-mono text-lg font-bold text-brand">₺{estimatedCharge.toFixed(2)}</span>
          </div>
          <p className="mt-1 text-[11px] text-slateMute">*Kupon kodu veya hoşgeldin indirimi siparişi oluşturunca kesin tutara yansır.</p>
        </div>

        <label className="flex items-start gap-2 text-xs text-slateMute">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
          <span>
            <a href="/mesafeli-satis-sozlesmesi" target="_blank" className="text-brand hover:underline">Mesafeli Satış Sözleşmesi</a>'ni ve{" "}
            <a href="/on-bilgilendirme-formu" target="_blank" className="text-brand hover:underline">Ön Bilgilendirme Formu</a>'nu okudum, kabul ediyorum.
          </span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || !service}
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] hover:bg-brandDark disabled:opacity-60"
        >
          {loading ? "Gönderiliyor…" : "Siparişi Oluştur 🚀"}
        </button>

        <p className="text-center text-xs text-slateMute">
          Sorun yaşarsan bize <a href="/iletisim" className="text-brand hover:underline">iletişim</a> sayfasından ulaşabilirsin.
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
