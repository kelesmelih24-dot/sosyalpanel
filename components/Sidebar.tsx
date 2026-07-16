"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const userLinks = [
  { href: "/dashboard", label: "Genel Bakış", icon: "◧" },
  { href: "/dashboard/siparis-ver", label: "Sipariş Ver", icon: "◈" },
  { href: "/dashboard/siparislerim", label: "Siparişlerim", icon: "☰" },
  { href: "/dashboard/bakiye-yukle", label: "Bakiye Yükle", icon: "◎" },
];

const adminLinks = [
  { href: "/admin", label: "Genel Bakış", icon: "◧" },
  { href: "/admin/hizmetler", label: "Hizmetler", icon: "◈" },
  { href: "/admin/tedarikciler", label: "Tedarikçiler", icon: "⇄" },
  { href: "/admin/siparisler", label: "Siparişler", icon: "☰" },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: "◎" },
];

export function Sidebar({ variant = "user" }: { variant?: "user" | "admin" }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const links = variant === "admin" ? adminLinks : userLinks;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-60 flex-col justify-between border-r border-line bg-panel px-4 py-6">
      <div>
        <Link href="/" className="mb-8 flex items-center gap-2 px-2 font-display text-lg font-bold text-ink">
          <Image src="/logo-icon.png" alt="" width={26} height={26} className="h-[26px] w-[26px]" />
          SosyalPanel
        </Link>
        <nav className="flex flex-col gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors focus-ring ${
                  active ? "bg-panel2 text-ink" : "text-mute hover:bg-panel2/60 hover:text-ink"
                }`}
              >
                <span className="w-4 text-center text-violet">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <button
        onClick={handleLogout}
        className="rounded-lg px-3 py-2.5 text-left text-sm text-mute transition-colors hover:bg-panel2/60 hover:text-magenta focus-ring"
      >
        ⏻ Çıkış Yap
      </button>
    </aside>
  );
}
