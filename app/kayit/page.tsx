"use client";

import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function KayitPage() {
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    function handler(e: Event) {
      setCaptchaToken((e as CustomEvent).detail);
    }
    window.addEventListener("turnstile-token", handler);
    return () => window.removeEventListener("turnstile-token", handler);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) {
      setError("Devam etmek için Kullanım Şartları'nı kabul etmelisin.");
      return;
    }
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setError("Lütfen doğrulama kutucuğunu tamamla.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        captchaToken: captchaToken ?? undefined,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message.includes("already") ? "Bu e-posta zaten kayıtlı." : "Kayıt oluşturulamadı, bilgilerini kontrol et.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void bg-grad-hero px-5">
        <div className="w-full max-w-sm rounded-2xl border border-line bg-panel p-8 text-center">
          <h1 className="font-display text-xl font-bold text-ink">E-postanı onayla</h1>
          <p className="mt-3 text-sm text-mute">
            <span className="text-ink">{email}</span> adresine bir onay bağlantısı gönderdik.
            Hesabına giriş yapmadan önce e-postanı onayla.
          </p>
          <Link href="/giris" className="mt-6 inline-block text-sm font-medium text-cyan hover:underline">
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-void bg-grad-hero px-5">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-panel p-8">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-ink"><Image src="/logo-icon.png" alt="" width={24} height={24} className="h-6 w-6" />SosyalPanel</Link>
        <h1 className="mt-4 font-display text-xl font-bold text-ink">Ücretsiz hesap oluştur</h1>
        <p className="mt-1 text-sm text-mute">Saniyeler içinde kayıt ol, bakiye yükle, sipariş ver.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm text-mute">Ad Soyad</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
              placeholder="Adın Soyadın"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-mute">E-posta</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
              placeholder="sen@ornek.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-mute">Şifre</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
              placeholder="En az 6 karakter"
            />
          </div>
          <label className="flex items-start gap-2 text-xs text-mute">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              <Link href="/kullanim-sartlari" className="text-cyan hover:underline">Kullanım Şartları</Link>'nı ve{" "}
              <Link href="/gizlilik-politikasi" className="text-cyan hover:underline">Gizlilik Politikası</Link>'nı okudum, kabul ediyorum.
            </span>
          </label>
          {error && <p className="text-sm text-magenta">{error}</p>}
          {TURNSTILE_SITE_KEY && (
            <>
              <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
              <div
                className="cf-turnstile"
                data-sitekey={TURNSTILE_SITE_KEY}
                data-callback="onTurnstileVerified"
              />
              <Script id="turnstile-callback" strategy="afterInteractive">
                {`window.onTurnstileVerified = function(token) {
                  window.dispatchEvent(new CustomEvent('turnstile-token', { detail: token }));
                };`}
              </Script>
            </>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-gradient-to-r from-magenta to-violet px-4 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.02] disabled:opacity-60 focus-ring"
          >
            {loading ? "Kayıt oluşturuluyor…" : "Kayıt Ol"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-mute">
          Zaten hesabın var mı?{" "}
          <Link href="/giris" className="font-medium text-cyan hover:underline">Giriş yap</Link>
        </p>
      </div>
    </div>
  );
}
