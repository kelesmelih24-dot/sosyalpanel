import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/PublicHeader";
import { PlatformIcon } from "@/components/PlatformIcon";
import { createClient } from "@/lib/supabase/server";

const platformNames: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  twitter: "Twitter",
  facebook: "Facebook",
  telegram: "Telegram",
  spotify: "Spotify",
  twitch: "Twitch",
  pinterest: "Pinterest",
  linkedin: "LinkedIn",
  soundcloud: "SoundCloud",
};

export default async function PlatformPage({ params }: { params: { platform: string } }) {
  const platform = params.platform;
  const platformName = platformNames[platform];
  if (!platformName) notFound();

  const supabase = createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("platform", platform)
    .order("sort_order");

  return (
    <div className="min-h-screen bg-paper">
      <PublicHeader />

      <section className="bg-grad-blush px-5 py-12">
        <div className="mx-auto flex max-w-6xl items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-white">
            <PlatformIcon platform={platform} className="h-8 w-8" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate md:text-3xl">{platformName} Hizmetleri</h1>
            <p className="mt-1 text-slateMute">
              {platformName} platformu için sağlamış olduğumuz uygun fiyatlı ve kaliteli servislerimizi
              inceleyebilir ve alışveriş yapabilirsiniz.
            </p>
            <span className="mt-2 inline-block rounded-full border border-dashed border-brand/50 px-3 py-1 text-xs font-medium text-brand">
              {categories?.length ?? 0} Kategori
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        {!categories?.length ? (
          <p className="text-center text-slateMute">
            Bu platform için henüz hizmet eklenmedi. Yakında burada olacak — admin panelinden hizmet eklemeyi unutma.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex flex-col items-center rounded-2xl border border-border2 bg-paper p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brandSoft text-brand">
                  <PlatformIcon platform={platform} className="h-6 w-6" />
                </div>
                <div className="font-display font-semibold text-slate">{c.name}</div>
                <div className="text-xs text-slateMute">Hizmetleri</div>
                <Link
                  href={`/hizmetler/${platform}/${c.id}`}
                  className="mt-4 rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brandDark"
                >
                  İncele →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

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
    </div>
  );
}
