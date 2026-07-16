import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-void/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-ink">
          <Image src="/logo-icon.png" alt="" width={28} height={28} className="h-7 w-7" priority />
          SosyalPanel
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-mute md:flex">
          <Link href="/#hizmetler" className="hover:text-ink transition-colors">Hizmetler</Link>
          <Link href="/#fiyatlar" className="hover:text-ink transition-colors">Fiyatlar</Link>
          <Link href="/#nasil-calisir" className="hover:text-ink transition-colors">Nasıl Çalışır</Link>
          <Link href="/#sss" className="hover:text-ink transition-colors">SSS</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/giris" className="text-sm font-medium text-mute hover:text-ink transition-colors focus-ring rounded px-2 py-1">
            Giriş Yap
          </Link>
          <Link
            href="/kayit"
            className="rounded-lg bg-gradient-to-r from-magenta to-violet px-4 py-2 text-sm font-semibold text-ink shadow-[0_0_0_1px_rgba(255,255,255,0.06)] transition-transform hover:scale-[1.03] focus-ring"
          >
            Ücretsiz Kayıt Ol
          </Link>
        </div>
      </div>
    </header>
  );
}
