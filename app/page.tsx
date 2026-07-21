import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PlatformIcon } from "@/components/PlatformIcon";
import { HeroIllustration } from "@/components/HeroIllustration";
import { createAdminClient } from "@/lib/supabase/server";

const platforms = [
  { key: "instagram", name: "Instagram", color: "#D6249F" },
  { key: "twitter", name: "Twitter", color: "#1DA1F2" },
  { key: "tiktok", name: "TikTok", color: "#010101" },
  { key: "youtube", name: "YouTube", color: "#FF0000" },
  { key: "facebook", name: "Facebook", color: "#1877F2" },
  { key: "spotify", name: "Spotify", color: "#1DB954" },
  { key: "telegram", name: "Telegram", color: "#26A5E4" },
  { key: "twitch", name: "Twitch", color: "#9146FF" },
  { key: "pinterest", name: "Pinterest", color: "#E60023" },
  { key: "linkedin", name: "LinkedIn", color: "#0A66C2" },
  { key: "soundcloud", name: "SoundCloud", color: "#FF5500" },
];

const steps = [
  { no: "01", title: "Hizmeti seç", text: "Platformunu ve paketini seç, hedef linki ve miktarı gir." },
  { no: "02", title: "Ödemeyi yap", text: "Gösterilen banka hesabına siparişin tutarını gönder." },
  { no: "03", title: "Dekontu yükle", text: "Ödeme onayını (dekont/ekran görüntüsü) sipariş formuna yükle." },
  { no: "04", title: "Onaylansın, teslim olsun", text: "Ekibimiz dekontu onaylayınca siparişin otomatik işleme girer." },
];

const faqs = [
  { q: "Üye olmam gerekiyor mu?", a: "Hayır. Hesap açmadan, hizmeti seçip link+miktar+e-posta bilgisiyle direkt sipariş verebilirsin." },
  { q: "Ödemeyi nasıl yapıyorum?", a: "Sipariş oluşturduğunda sana banka hesap bilgilerimiz gösterilir. Ödemeyi yaptıktan sonra dekontunu (banka makbuzu veya ekran görüntüsü) sipariş formuna yüklemen yeterli." },
  { q: "Dekontu yükledikten sonra ne kadar sürede onaylanır?", a: "Dekontun yüklendiği anda ekibimize anında bildirim gider. Genellikle kısa süre içinde onaylanıp siparişin işleme alınır." },
  { q: "Siparişimin durumunu nasıl takip ederim?", a: "'Sipariş Sorgula' sayfasından sipariş numaranı ve e-postanı girerek anlık durumu görebilirsin." },
  { q: "Siparişim düşerse ne olur?", a: "Çoğu hizmette düşme garantisi vardır; garanti süresi içinde düşen adetler otomatik olarak tamamlanır." },
];

export default async function LandingPage() {
  const admin = createAdminClient();
  const { count: orderCount } = await admin.from("orders").select("id", { count: "exact", head: true });
  const { count: completedCount } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "completed");

  const { data: reviews } = await admin
    .from("reviews")
    .select("author_name, comment, rating, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(6);

  const reviewCount = reviews?.length ?? 0;
  const avgRating = reviewCount ? (reviews!.reduce((s: number, r: any) => s + r.rating, 0) / reviewCount).toFixed(1) : null;

  const stats = [
    { label: "Teslim Edilen Sipariş", value: (orderCount ?? 0).toLocaleString("tr-TR") + "+" },
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
              Üye olmadan, hesap açmadan sipariş verebilirsiniz! Hizmeti seç, ödemeni yap, dekontunu yükle —
              onaylandığında siparişin otomatik işleme girer.
            </p>

            {avgRating && (
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="text-amber-500">{"★".repeat(Math.round(Number(avgRating)))}{"☆".repeat(5 - Math.round(Number(avgRating)))}</span>
                <span className="font-semibold text-slate">{avgRating}</span>
                <span className="text-slateMute">({reviewCount} değerlendirme)</span>
              </div>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/#hizmetler"
                className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.03] hover:bg-brandDark"
              >
                Hemen Sipariş Ver
              </Link>
              <Link href="/siparis-sorgula" className="text-sm font-medium text-slateMute hover:text-brand transition-colors">
                Sipariş sorgula →
              </Link>
            </div>

            {/* Platform icon row */}
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {platforms.map((p) => (
                <Link
                  key={p.key}
                  href={`/hizmetler/${p.key}`}
                  title={p.name}
                  className="flex h-16 w-16 items-center justify-center rounded-xl bg-paper text-slate shadow-sm ring-1 ring-border2 transition-transform hover:scale-110 hover:text-brand"
                >
                  <PlatformIcon platform={p.key} className="h-8 w-8" />
                </Link>
              ))}
            </div>
          </div>

          <HeroIllustration className="mx-auto w-full max-w-sm md:max-w-md" />
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-brand">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-5 py-6 text-white sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-2xl font-bold md:text-3xl">{s.value}</div>
              <div className="mt-1 text-xs text-white/80 md:text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PLATFORMS / HİZMETLER */}
      <section id="hizmetler" className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center font-display text-2xl font-bold text-slate md:text-3xl">Hizmetlerimiz</h2>
        <p className="mt-2 text-center text-slateMute">Platformunu seç, o platforma özel tüm hizmet kategorilerini gör.</p>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {platforms.map((p) => (
            <Link
              key={p.key}
              href={`/hizmetler/${p.key}`}
              className="group flex flex-col items-center justify-center gap-3 rounded-2xl py-10 text-center shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg"
              style={{ backgroundColor: p.color }}
            >
              <PlatformIcon platform={p.key} className="h-10 w-10 text-white" />
              <div>
                <div className="font-display text-base font-bold uppercase tracking-wide text-white">{p.name}</div>
                <div className="text-xs text-white/80">Hizmetleri</div>
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

      {/* TRUST BADGES */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            { icon: "🛡️", title: "Güvenilir Hizmet", text: "Tüm siparişler kayıt altında tutulur, işlemlerin durumunu her an takip edebilirsin." },
            { icon: "💳", title: "Güvenli Ödeme", text: "Havale/EFT ve kripto ödemeleri, onay sürecinden geçtikten sonra hesabına yansır." },
            { icon: "🎧", title: "Destek", text: "Sorularınız için e-posta ve Whatsapp üzerinden bize ulaşabilirsiniz." },
          ].map((b) => (
            <div key={b.title} className="rounded-2xl border border-border2 bg-blush p-6 text-center">
              <div className="text-3xl">{b.icon}</div>
              <div className="mt-3 font-display font-semibold text-slate">{b.title}</div>
              <div className="mt-2 text-sm text-slateMute">{b.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS — real, admin-curated only; no fabricated testimonials */}
      <section className="bg-blush py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <h2 className="font-display text-2xl font-bold text-slate md:text-3xl">Müşteri Yorumları</h2>
            <Link
              href="/degerlendirme"
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] hover:bg-brandDark"
            >
              ⭐ Değerlendirme Bırak
            </Link>
          </div>
          {reviewCount > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {reviews!.map((r: any, i: number) => (
                <div key={i} className="rounded-2xl border border-border2 bg-paper p-5 shadow-sm">
                  <div className="text-amber-500">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                  <p className="mt-3 text-sm text-slateMute">{r.comment}</p>
                  <div className="mt-3 font-display text-sm font-semibold text-slate">{r.author_name}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-center text-slateMute">Henüz değerlendirme yok — ilk yorumu sen bırak!</p>
          )}
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
            <a href="mailto:destek@sosyalpanel.tr" className="rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25 transition-colors">E-Posta</a>
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
