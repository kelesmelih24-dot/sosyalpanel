"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SifremiUnuttumPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/sifre-guncelle`,
    });
    setLoading(false);
    if (error) {
      setError("Bir sorun oluştu, lütfen tekrar dene.");
      return;
    }
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-void bg-grad-hero px-5">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-panel p-8">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-ink"><Image src="/logo-icon.png" alt="" width={24} height={24} className="h-6 w-6" />SosyalPanel</Link>
        <h1 className="mt-4 font-display text-xl font-bold text-ink">Şifreni sıfırla</h1>

        {sent ? (
          <p className="mt-4 text-sm text-mute">
            <span className="text-ink">{email}</span> adresine bir sıfırlama bağlantısı gönderdik.
            E-postanı kontrol et.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-mute">E-postanı gir, sana bir sıfırlama bağlantısı gönderelim.</p>
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
                placeholder="sen@ornek.com"
              />
              {error && <p className="text-sm text-magenta">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-gradient-to-r from-magenta to-violet px-4 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.02] disabled:opacity-60 focus-ring"
              >
                {loading ? "Gönderiliyor…" : "Sıfırlama Bağlantısı Gönder"}
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-mute">
          <Link href="/giris" className="font-medium text-cyan hover:underline">Giriş sayfasına dön</Link>
        </p>
      </div>
    </div>
  );
}
