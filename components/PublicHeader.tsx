"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { CampaignBanner } from "@/components/CampaignBanner";
import { FloatingWhatsapp } from "@/components/FloatingWhatsapp";

const platforms = [
  { key: "instagram", name: "Instagram" },
  { key: "twitter", name: "Twitter" },
  { key: "tiktok", name: "TikTok" },
  { key: "youtube", name: "YouTube" },
  { key: "facebook", name: "Facebook" },
  { key: "spotify", name: "Spotify" },
  { key: "telegram", name: "Telegram" },
  { key: "twitch", name: "Twitch" },
  { key: "pinterest", name: "Pinterest" },
  { key: "linkedin", name: "LinkedIn" },
  { key: "soundcloud", name: "SoundCloud" },
];

export function PublicHeader() {
  const [hizmetlerOpen, setHizmetlerOpen] = useState(false);
  const [kurumsalOpen, setKurumsalOpen] = useState(false);

  return (
    <>
      <CampaignBanner />
      <header className="sticky top-0 z-40 bg-paper">
      {/* Utility bar */}
      <div className="hidden border-b border-border2 bg-blush md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-2 text-sm text-slateMute">
          <div className="flex items-center gap-5">
            <a href="mailto:destek@sosyalpanel.com" className="flex items-center gap-1.5 hover:text-brand transition-colors">
              ✉️ destek@sosyalpanel.com
            </a>
            <a
              href="https://wa.me/905000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-brand transition-colors"
            >
              💬 Whatsapp
            </a>
          </div>
          <Link href="/siparis-sorgula" className="flex items-center gap-1.5 font-medium text-brand hover:underline">
            🔍 Sipariş Sorgula
          </Link>
        </div>
      </div>

      {/* Main nav */}
      <div className="border-b border-border2">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-slate">
            <Image src="/logo-icon.png" alt="" width={28} height={28} className="h-7 w-7" priority />
            SosyalPanel
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate md:flex">
            <Link href="/" className="hover:text-brand transition-colors">Ana Sayfa</Link>

            <div
              className="relative"
              onMouseEnter={() => setHizmetlerOpen(true)}
              onMouseLeave={() => setHizmetlerOpen(false)}
            >
              <button className="flex items-center gap-1 hover:text-brand transition-colors">
                Hizmetler <span className="text-xs">▾</span>
              </button>
              {hizmetlerOpen && (
                <div className="absolute left-0 top-full grid w-96 grid-cols-2 gap-1 rounded-xl border border-border2 bg-paper p-3 shadow-lg">
                  {platforms.map((p) => (
                    <Link
                      key={p.key}
                      href={`/hizmetler/${p.key}`}
                      className="rounded-lg px-3 py-2 text-sm text-slate hover:bg-brandSoft hover:text-brand transition-colors"
                    >
                      {p.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div
              className="relative"
              onMouseEnter={() => setKurumsalOpen(true)}
              onMouseLeave={() => setKurumsalOpen(false)}
            >
              <button className="flex items-center gap-1 hover:text-brand transition-colors">
                Kurumsal <span className="text-xs">▾</span>
              </button>
              {kurumsalOpen && (
                <div className="absolute left-0 top-full flex w-56 flex-col gap-1 rounded-xl border border-border2 bg-paper p-3 shadow-lg">
                  <Link href="/hakkimizda" className="rounded-lg px-3 py-2 text-sm text-slate hover:bg-brandSoft hover:text-brand transition-colors">Hakkımızda</Link>
                  <Link href="/kullanim-sartlari" className="rounded-lg px-3 py-2 text-sm text-slate hover:bg-brandSoft hover:text-brand transition-colors">Kullanım Şartları</Link>
                  <Link href="/gizlilik-politikasi" className="rounded-lg px-3 py-2 text-sm text-slate hover:bg-brandSoft hover:text-brand transition-colors">Gizlilik Politikası</Link>
                  <Link href="/kvkk-aydinlatma" className="rounded-lg px-3 py-2 text-sm text-slate hover:bg-brandSoft hover:text-brand transition-colors">KVKK Aydınlatma Metni</Link>
                </div>
              )}
            </div>

            <Link href="/iletisim" className="hover:text-brand transition-colors">İletişim</Link>
          </nav>

          <Link
            href="/#hizmetler"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.03] hover:bg-brandDark"
          >
            Hemen Sipariş Ver
          </Link>
        </div>
      </div>
    </header>
    <FloatingWhatsapp />
    </>
  );
}
