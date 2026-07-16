"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function GirisPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("E-posta veya şifre hatalı. Lütfen tekrar dene.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-void bg-grad-hero px-5">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-panel p-8">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-ink"><Image src="/logo-icon.png" alt="" width={24} height={24} className="h-6 w-6" />SosyalPanel</Link>
        <h1 className="mt-4 font-display text-xl font-bold text-ink">Tekrar hoş geldin</h1>
        <p className="mt-1 text-sm text-mute">Hesabına giriş yap ve siparişlerine devam et.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm text-mute">Şifre</label>
              <Link href="/sifremi-unuttum" className="text-xs text-cyan hover:underline">Şifremi unuttum</Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-magenta">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-gradient-to-r from-magenta to-violet px-4 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.02] disabled:opacity-60 focus-ring"
          >
            {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-mute">
          Hesabın yok mu?{" "}
          <Link href="/kayit" className="font-medium text-cyan hover:underline">Kayıt ol</Link>
        </p>
      </div>
    </div>
  );
}
