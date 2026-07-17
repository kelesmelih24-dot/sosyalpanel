import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PlatformIcon } from "@/components/PlatformIcon";
import { HeroIllustration } from "@/components/HeroIllustration";
import { createAdminClient } from "@/lib/supabase/server";

const platforms = [
  { key: "instagram", name: "Instagram" },
  { key: "tiktok", name: "TikTok" },
  { key: "youtube", name: "YouTube" },
  { key: "twitter", name: "X / Twitter" },
  { key: "facebook", name: "Facebook" },
  { key: "telegram", name: "Telegram" },
  { key: "spotify", name: "Spotify" },
  { key: "pinterest", name: "Pinterest" },
  { key: "linkedin", name: "LinkedIn" },
  { key: "soundcloud", name: "SoundCloud" },
];

const steps = [
  { no: "01", title: "Hesap oluştur", text: "E-postanla saniyeler içinde kayıt ol." },
  { no: "02", title: "Bakiye yükle", text: "Havale veya kripto ile bakiyeni anında hesabına yansıt." },
  { no: "03", title: "Hizmeti seç, linki yapıştır", text: "Platform, miktar ve hedef linki gir." },
  { no: "04", title: "Siparişini takip et", text: "Durumu panelden veya sipariş sorgula sayfasından canlı izle." },
];

const faqs = [
  { q: "Ödeme yaptıktan sonra bakiyem ne zaman yüklenir?", a: "Havale ve kripto ödemelerinde bakiye, dekont onayından sonra birkaç dakika içinde hesabına yansır." },
  { q: "Siparişim düşerse ne olur?", a: "Çoğu hizmette düşme garantisi vardır; garanti süresi içinde düşen adetler otomatik olarak tamamlanır." },
  { q: "Üye olmadan sipariş verebilir miyim?", a: "Sipariş vermek için ücretsiz üyelik gerekir, ama mevcut bir siparişini üye olmadan da 'Sipariş Sorgula' sayfasından takip edebilirsin." },
  { q: "Yanlış link girdim, iptal edebilir miyim?", a: "Sipariş 'beklemede' durumundayken destek ekibine yazarak iptal talep edebilirsin." },
];

export default async function LandingPage() {
  const admin = createAdminClient();
  const { count: orderCount } = await admin.from("orders").select("id", { count: "exact", head: true });
  const { count: userCount } = await admin.from("profiles").select("id", { count: "exact", head: true });
  const { count: completedCount } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "completed");

  const stats = [
    { label: "Teslim Edilen Sipariş", value: (orderCount ?? 0).toLocaleString("tr-TR") + "+" },
    { label: "Kayıtlı Üye", value: (userCount ?? 0).toLocaleString("tr-TR") + "+" },
    { label: "Tamamlanan Sipariş", value: (completedCount ?? 0).toLocaleString("tr-TR") + "+" },
    { label: "Desteklenen Platform", value: String(platforms.length) },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <PublicHeader />

      {/* HERO */}
      <section className="bg-grad-blush">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-14 md:grid-cols-2 md:items-center md:pb-20 md:pt-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-brand/50 px-3.5 py-1.5 text-sm font-medium text-brand">
              🛒 Takipçi Satın Al
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] text-slate md:text-5xl">
              SosyalPanel İle Birlikte{" "}
              <span className="text-brand">İnsanlara Farkınızı Gösterin!</span>
            </h1>
            <p className="mt-5 max-w-md text-slateMute">
              Sosyal medyada şimdiye kadar hiç olmadığı kadar güçlüsünüz! Kontrol tamamen sizin elinizde.
              Hemen platformunuzu ve paketinizi belirleyip sipariş oluşturun.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/kayit"
                className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.03] hover:bg-brandDark"
              >
                Hemen Başla — Ücretsiz
              </Link>
              <Link href="/siparis-sorgula" className="text-sm font-medium text-slateMute hover:text-brand transition-colors">
                Sipariş sorgula →
              </Link>
            </div>

            {/* Platform icon row */}
            <div className="mt-10 flex flex-wrap justify-center gap-3 md:justify-start">
              {platforms.map((p) => (
                <Link
                  key={p.key}
                  href={`/hizmetler/${p.key}`}
                  title={p.name}
                  className="flex h-14 w-14 items-center justify-center rounded-xl bg-paper text-slate shadow-sm ring-1 ring-border2 transition-transform hover:scale-110 hover:text-brand"
                >
                  <PlatformIcon platform={p.key} className="h-7 w-7" />
                </Link>
              ))}
            </div>
          </div>

          <HeroIllustration className="mx-auto w-full max-w-sm md:max-w-md" />
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-brand">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-6 text-white md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-2xl font-bold md:text-3xl">{s.value}</div>
              <div className="mt-1 text-xs text-white/80 md:text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PLATFORMS / HİZMETLER */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center font-display text-2xl font-bold text-slate md:text-3xl">Popüler Hizmetler</h2>
        <p className="mt-2 text-center text-slateMute">Platformunu seç, o platforma özel tüm hizmet kategorilerini gör.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-5">
          {platforms.slice(0, 5).map((p) => (
            <Link
              key={p.key}
              href={`/hizmetler/${p.key}`}
              className="group rounded-2xl border border-border2 bg-paper p-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brandSoft text-brand">
                <PlatformIcon platform={p.key} className="h-6 w-6" />
              </div>
              <div className="font-display font-semibold text-slate">{p.name}</div>
              <div className="mt-2 text-sm font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
                İncele →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-blush py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center font-display text-2xl font-bold text-slate md:text-3xl">Nasıl çalışır</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {steps.map((s) => (
              <div key={s.no} className="rounded-2xl border border-border2 bg-paper p-5">
                <div className="font-mono text-sm font-bold text-brand">{s.no}</div>
                <div className="mt-2 font-display font-semibold text-slate">{s.title}</div>
                <div className="mt-2 text-sm text-slateMute">{s.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center font-display text-2xl font-bold text-slate md:text-3xl">Sıkça sorulan sorular</h2>
        <div className="mx-auto mt-8 max-w-3xl divide-y divide-border2 rounded-2xl border border-border2 bg-paper">
          {faqs.map((f) => (
            <details key={f.q} className="group px-5 py-4 open:bg-blush/60">
              <summary className="cursor-pointer list-none font-medium text-slate marker:content-none">
                <span className="flex items-center justify-between">
                  {f.q}
                  <span className="text-brand transition-transform group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm text-slateMute">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CONTACT CTA BAR */}
      <section className="bg-brand">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-white md:flex-row">
          <div>
            <div className="font-display text-xl font-bold">Bize Ulaşabilirsiniz!</div>
            <div className="text-sm text-white/80">Aktif iletişim adreslerimizden bize ulaşabilirsiniz.</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/iletisim" className="rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25 transition-colors">İletişim</Link>
            <a href="mailto:destek@sosyalpanel.com" className="rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25 transition-colors">E-Posta</a>
            <a href="https://wa.me/905000000000" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25 transition-colors">Whatsapp</a>
          </div>
        </div>
      </section>

      <footer className="border-t border-border2 bg-paper py-8 text-center text-xs text-slateMute">
        <div className="mb-3 flex flex-wrap items-center justify-center gap-4">
          <Link href="/kullanim-sartlari" className="hover:text-brand transition-colors">Kullanım Şartları</Link>
          <Link href="/gizlilik-politikasi" className="hover:text-brand transition-colors">Gizlilik Politikası</Link>
          <Link href="/kvkk-aydinlatma" className="hover:text-brand transition-colors">KVKK Aydınlatma Metni</Link>
        </div>
        © {new Date().getFullYear()} SosyalPanel. Tüm hakları saklıdır.
        <div className="mt-1">
          Bir{" "}
          <a
            href="https://mksoftware.com.tr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slateMute hover:text-brand transition-colors underline underline-offset-2"
          >
            MK Software
          </a>{" "}
          ürünüdür.
        </div>
      </footer>
    </div>
  );
}
