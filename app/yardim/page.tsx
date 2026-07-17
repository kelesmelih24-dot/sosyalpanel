"use client";

import { useMemo, useState } from "react";
import { PublicHeader } from "@/components/PublicHeader";
import { MIN_ORDER_AMOUNT, BULK_DISCOUNT_THRESHOLD, BULK_DISCOUNT_PERCENT, WELCOME_DISCOUNT_PERCENT } from "@/lib/constants";

const articles = [
  { q: "Üye olmam gerekiyor mu?", a: "Hayır. Hesap açmadan, hizmeti seçip link+miktar+e-posta bilgisiyle direkt sipariş verebilirsin." },
  { q: "Ödemeyi nasıl yapıyorum?", a: "Sipariş oluşturduğunda banka bilgileri e-postana gönderilir. Ödemeni yaptıktan sonra dekontunu yüklemen yeterli." },
  { q: "Minimum sipariş tutarı nedir?", a: `Minimum sipariş tutarı ₺${MIN_ORDER_AMOUNT}'dir.` },
  { q: "Toplu alımda indirim var mı?", a: `${BULK_DISCOUNT_THRESHOLD.toLocaleString("tr-TR")}+ adet siparişlerde otomatik %${BULK_DISCOUNT_PERCENT} indirim uygulanır.` },
  { q: "İlk siparişimde indirim var mı?", a: `Evet, ilk siparişinde otomatik %${WELCOME_DISCOUNT_PERCENT} indirim uygulanır, kupon kodu gerekmez.` },
  { q: "İade politikanız nedir?", a: "Tüm satışlar kesindir, iade yapılmamaktadır." },
  { q: "Dekontu ne zaman yüklemeliyim?", a: "Sipariş oluşturulduktan sonra 24 saat içinde dekont yüklenmezse sipariş otomatik iptal edilir. 12. saatte hatırlatma gönderiyoruz." },
  { q: "Siparişimin durumunu nasıl görürüm?", a: "'Sipariş Sorgula' sayfasından sipariş numaranı ve e-postanı girerek anlık durumu görebilirsin." },
  { q: "Yanlış link girdim, ne yapmalıyım?", a: "Dekont yüklemeden önce bize İletişim sayfasından ulaşarak düzeltme talep edebilirsin." },
  { q: "Fatura alabilir miyim?", a: "Evet, siparişin onaylandıktan sonra faturan hazırlanıp 'Sipariş Sorgula' sayfasında sana sunulur." },
  { q: "Kredi kartıyla ödeme yapabilir miyim?", a: "Şu an sadece Havale/EFT kabul ediyoruz, kredi kartı ile ödeme çok yakında aktif olacak." },
  { q: "Değerlendirme bırakırsam ne kazanırım?", a: "İlk değerlendirmende %5 indirim kodu kazanırsın, 30 gün geçerlidir." },
  { q: "Destek saatleriniz nedir?", a: "Destek ekibimiz hafta içi 09:00-18:00 arası aktif, ama site 7/24 otomatik çalışır." },
  { q: "Fiyatlara KDV dahil mi?", a: "Evet, tüm fiyatlarımız KDV dahildir." },
];

export default function YardimPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return articles;
    const q = query.toLowerCase();
    return articles.filter((a) => a.q.toLowerCase().includes(q) || a.a.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="min-h-screen bg-paper">
      <PublicHeader />
      <div className="mx-auto max-w-2xl px-5 py-16">
        <h1 className="text-center font-display text-2xl font-bold text-slate">🆘 Yardım Merkezi</h1>
        <p className="mt-2 text-center text-slateMute">Aradığın konuyu yaz, ilgili yazıları anında gör.</p>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="örn. iade, dekont, indirim…"
          className="mt-6 w-full rounded-lg border border-border2 bg-white px-4 py-3 text-slate focus:outline-none focus:ring-2 focus:ring-brand"
        />

        <div className="mt-6 divide-y divide-border2 rounded-2xl border border-border2 bg-white">
          {filtered.map((a) => (
            <details key={a.q} className="group px-5 py-4 open:bg-blush/60">
              <summary className="cursor-pointer list-none font-medium text-slate marker:content-none">
                <span className="flex items-center justify-between">
                  {a.q}
                  <span className="text-brand transition-transform group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm text-slateMute">{a.a}</p>
            </details>
          ))}
          {!filtered.length && <p className="px-5 py-8 text-center text-slateMute">Sonuç bulunamadı.</p>}
        </div>
      </div>
    </div>
  );
}
