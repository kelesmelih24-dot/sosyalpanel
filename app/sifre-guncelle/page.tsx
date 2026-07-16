"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SifreGuncellePage() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError("Şifre güncellenemedi. Bağlantının süresi dolmuş olabilir, tekrar talep et.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-void bg-grad-hero px-5">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-panel p-8">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-ink"><Image src="/logo-icon.png" alt="" width={24} height={24} className="h-6 w-6" />SosyalPanel</Link>
        <h1 className="mt-4 font-display text-xl font-bold text-ink">Yeni şifre belirle</h1>

        {done ? (
          <p className="mt-4 text-sm text-emerald-400">Şifren güncellendi, panele yönlendiriliyorsun…</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
              placeholder="Yeni şifre (en az 6 karakter)"
            />
            {error && <p className="text-sm text-magenta">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-gradient-to-r from-magenta to-violet px-4 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.02] disabled:opacity-60 focus-ring"
            >
              {loading ? "Güncelleniyor…" : "Şifreyi Güncelle"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
