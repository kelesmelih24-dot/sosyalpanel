import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { PlatformIcon } from "@/components/PlatformIcon";
import { Ticker } from "@/components/Ticker";

const platforms = [
  { key: "instagram", name: "Instagram", desc: "Takipçi, beğeni, izlenme, yorum" },
  { key: "tiktok", name: "TikTok", desc: "Takipçi, beğeni, izlenme, canlı yayın" },
  { key: "youtube", name: "YouTube", desc: "İzlenme, abone, beğeni, saat" },
  { key: "twitter", name: "X / Twitter", desc: "Takipçi, beğeni, retweet, görüntülenme" },
  { key: "telegram", name: "Telegram", desc: "Üye, görüntülenme, oy" },
];

const sampleServices = [
  { platform: "instagram", name: "Instagram Takipçi — Türk, gerçek profil", price: "48,90", unit: "1000 adet", min: 100, speed: "0-1 saat içinde başlar" },
  { platform: "instagram", name: "Instagram Beğeni — Hızlı teslimat", price: "12,50", unit: "1000 adet", min: 50, speed: "Anında başlar" },
  { platform: "tiktok", name: "TikTok Takipçi — Global, düşük düşme", price: "39,90", unit: "1000 adet", min: 100, speed: "0-2 saat içinde başlar" },
  { platform: "youtube", name: "YouTube İzlenme — Yüksek izlenme süreli", price: "89,00", unit: "1000 adet", min: 500, speed: "0-6 saat içinde başlar" },
];

const steps = [
  { no: "01", title: "Hesap oluştur", text: "E-postanla saniyeler içinde kayıt ol, kartsız da bakiye yükleyebileceğin yöntemleri gör." },
  { no: "02", title: "Bakiye yükle", text: "Havale, kripto veya diğer ödeme yöntemleriyle bakiyeni anında hesabına yansıt." },
  { no: "03", title: "Hizmeti seç, linki yapıştır", text: "Platform, miktar ve hedef linki gir. Panel siparişini otomatik kuyruğa alır." },
  { no: "04", title: "Siparişini takip et", text: "Sipariş panelinden durumu canlı izle: beklemede, işleniyor, tamamlandı." },
];

const faqs = [
  { q: "Ödeme yaptıktan sonra bakiyem ne zaman yüklenir?", a: "Havale ve kripto ödemelerinde bakiye, dekont onayından sonra birkaç dakika içinde hesabına yansır." },
  { q: "Siparişim düşerse ne olur?", a: "Çoğu hizmette düşme garantisi vardır; garanti süresi içinde düşen adetler otomatik olarak tamamlanır." },
  { q: "API ile kendi sitemden panele bağlanabilir miyim?", a: "Evet, panelin API anahtarını hesap ayarlarından alıp kendi sitenden veya botundan sipariş gönderebilirsin." },
  { q: "Yanlış link girdim, iptal edebilir miyim?", a: "Sipariş 'beklemede' durumundayken destek ekibine yazarak iptal talep edebilirsin." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-void">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-grad-hero">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-16 md:grid-cols-2 md:pb-24 md:pt-24">
          <div className="rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-panel/60 px-3 py-1 text-xs font-medium text-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan glow-pulse" />
              700+ aktif hizmet, canlı stok takibi
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.08] text-ink md:text-5xl">
              Sosyal medya büyümeni <span className="text-transparent bg-clip-text bg-gradient-to-r from-magenta via-violet to-cyan">toptan fiyatına</span> yönet.
            </h1>
            <p className="mt-5 max-w-md text-mute">
              Instagram, TikTok, YouTube ve daha fazlası için takipçi, beğeni ve izlenme hizmetlerini
              dakikalar içinde satın al. Bakiyeni yükle, linki yapıştır, siparişini panelden canlı izle.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/kayit"
                className="rounded-lg bg-gradient-to-r from-magenta to-violet px-6 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.03] focus-ring"
              >
                Hemen Başla — Ücretsiz
              </Link>
              <Link href="#fiyatlar" className="text-sm font-medium text-mute hover:text-ink transition-colors">
                Fiyat listesine göz at →
              </Link>
            </div>
          </div>

          {/* Signature element: departures-board style live ticker */}
          <div className="rise rounded-2xl border border-line bg-grad-card p-6 shadow-2xl" style={{ animationDelay: "120ms" }}>
            <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
              <span className="text-xs uppercase tracking-[0.14em] text-mute">Canlı Panel İstatistikleri</span>
              <span className="flex h-2 w-2 rounded-full bg-amber glow-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Ticker target={128430} label="Teslim edilen sipariş" accent="text-magenta" />
              <Ticker target={4210} label="Aktif üye" accent="text-cyan" />
              <Ticker target={98} suffix="%" label="Ortalama teslimat başarısı" accent="text-amber" />
              <Ticker target={6} label="Desteklenen platform" accent="text-violet" />
            </div>
            <div className="mt-6 grid grid-cols-5 gap-2 border-t border-line pt-5">
              {platforms.map((p) => (
                <div key={p.key} className="flex flex-col items-center gap-1.5 text-mute">
                  <PlatformIcon platform={p.key} className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORMS */}
      <section id="hizmetler" className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">Desteklenen platformlar</h2>
        <p className="mt-2 max-w-lg text-mute">Her platform için ayrı kategoriler ve onlarca hizmet çeşidi bulunur.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {platforms.map((p) => (
            <div key={p.key} className="group rounded-xl border border-line bg-panel p-5 transition-colors hover:border-violet/60">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-magenta/20 to-cyan/20 text-ink">
                <PlatformIcon platform={p.key} className="h-5 w-5" />
              </div>
              <div className="font-display font-semibold text-ink">{p.name}</div>
              <div className="mt-1 text-sm text-mute">{p.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING SAMPLE */}
      <section id="fiyatlar" className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">Örnek fiyat listesi</h2>
        <p className="mt-2 max-w-lg text-mute">Kayıt olduğunda tüm hizmetleri ve güncel fiyatları panelinde görürsün.</p>
        <div className="mt-8 overflow-hidden rounded-xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-panel2 text-mute">
              <tr>
                <th className="px-5 py-3 font-medium">Hizmet</th>
                <th className="px-5 py-3 font-medium">Min. Adet</th>
                <th className="px-5 py-3 font-medium">Teslimat</th>
                <th className="px-5 py-3 font-medium text-right">Fiyat</th>
              </tr>
            </thead>
            <tbody>
              {sampleServices.map((s) => (
                <tr key={s.name} className="border-t border-line bg-panel">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <PlatformIcon platform={s.platform} className="h-4 w-4 text-mute" />
                      <span className="text-ink">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-mute">{s.min}</td>
                  <td className="px-5 py-4 text-mute">{s.speed}</td>
                  <td className="px-5 py-4 text-right font-mono font-semibold text-cyan">₺{s.price} <span className="text-xs font-sans text-mute">/ {s.unit}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="nasil-calisir" className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">Nasıl çalışır</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.no} className="rounded-xl border border-line bg-panel p-5">
              <div className="font-mono text-sm text-magenta">{s.no}</div>
              <div className="mt-2 font-display font-semibold text-ink">{s.title}</div>
              <div className="mt-2 text-sm text-mute">{s.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="sss" className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">Sıkça sorulan sorular</h2>
        <div className="mt-8 divide-y divide-line rounded-xl border border-line bg-panel">
          {faqs.map((f) => (
            <details key={f.q} className="group px-5 py-4 open:bg-panel2/40">
              <summary className="cursor-pointer list-none font-medium text-ink marker:content-none">
                <span className="flex items-center justify-between">
                  {f.q}
                  <span className="text-mute transition-transform group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm text-mute">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="rounded-2xl border border-line bg-gradient-to-r from-magenta/20 via-violet/20 to-cyan/20 p-10 text-center">
          <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">Bakiyeni yükle, ilk siparişini bugün ver.</h2>
          <Link
            href="/kayit"
            className="mt-6 inline-block rounded-lg bg-gradient-to-r from-magenta to-violet px-6 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.03] focus-ring"
          >
            Ücretsiz Kayıt Ol
          </Link>
        </div>
      </section>

      <footer className="border-t border-line py-8 text-center text-xs text-mute">
        <div className="mb-3 flex flex-wrap items-center justify-center gap-4">
          <Link href="/kullanim-sartlari" className="hover:text-ink transition-colors">Kullanım Şartları</Link>
          <Link href="/gizlilik-politikasi" className="hover:text-ink transition-colors">Gizlilik Politikası</Link>
          <Link href="/kvkk-aydinlatma" className="hover:text-ink transition-colors">KVKK Aydınlatma Metni</Link>
        </div>
        © {new Date().getFullYear()} SosyalPanel. Tüm hakları saklıdır.
        <div className="mt-1">
          Bir{" "}
          <a
            href="https://mksoftware.com.tr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-mute hover:text-ink transition-colors underline underline-offset-2"
          >
            MK Software
          </a>{" "}
          ürünüdür.
        </div>
      </footer>
    </div>
  );
}
