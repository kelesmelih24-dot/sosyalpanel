"use client";

import { useEffect, useState } from "react";

type Provider = { id: number; name: string; api_url: string; is_active: boolean; last_balance?: number | null; low_balance_threshold?: number };

export default function AdminTedarikcilerPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [form, setForm] = useState({ name: "", api_url: "", api_key: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [catalog, setCatalog] = useState<{ id: number; services: any[] } | null>(null);

  async function load() {
    const res = await fetch("/api/admin/providers");
    const data = await res.json();
    setProviders(data.providers ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/admin/providers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "Tedarikçi eklenemedi.");
    setForm({ name: "", api_url: "", api_key: "" });
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu tedarikçiyi silmek istediğine emin misin?")) return;
    await fetch(`/api/admin/providers?id=${id}`, { method: "DELETE" });
    load();
  }

  async function viewCatalog(id: number) {
    setCatalog({ id, services: [] });
    const res = await fetch("/api/admin/providers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    setCatalog({ id, services: Array.isArray(data.services) ? data.services : [] });
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Tedarikçiler</h1>
        <p className="mt-1 text-mute">
          JustAnotherPanel, Peakerr gibi Perfect Panel uyumlu API veren sağlayıcılarını buraya ekle. Hizmet
          oluştururken bir tedarikçi ve onun servis ID'sini seçtiğinde siparişler otomatik olarak iletilir.
        </p>
      </div>

      <form onSubmit={handleCreate} className="flex flex-col gap-3 rounded-xl border border-line bg-panel p-5 max-w-lg">
        <h2 className="font-display font-semibold text-ink">Yeni tedarikçi ekle</h2>
        <input
          required
          placeholder="Tedarikçi adı (örn. JustAnotherPanel)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
        />
        <input
          required
          placeholder="API URL (örn. https://justanotherpanel.com/api/v2)"
          value={form.api_url}
          onChange={(e) => setForm({ ...form, api_url: e.target.value })}
          className="rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
        />
        <input
          required
          type="password"
          placeholder="API Anahtarı"
          value={form.api_key}
          onChange={(e) => setForm({ ...form, api_key: e.target.value })}
          className="rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
        />
        {error && <p className="text-sm text-magenta">{error}</p>}
        <button
          disabled={loading}
          className="self-start rounded-lg bg-gradient-to-r from-magenta to-violet px-4 py-2 text-sm font-semibold text-ink transition-transform hover:scale-[1.02] disabled:opacity-60 focus-ring"
        >
          {loading ? "Ekleniyor…" : "Tedarikçiyi Ekle"}
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-line bg-panel">
        <table className="w-full text-left text-sm">
          <thead className="text-mute">
            <tr>
              <th className="px-5 py-3 font-medium">Ad</th>
              <th className="px-5 py-3 font-medium">API URL</th>
              <th className="px-5 py-3 font-medium">Son Bilinen Bakiye</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="px-5 py-3 text-ink">{p.name}</td>
                <td className="px-5 py-3 text-mute">{p.api_url}</td>
                <td className="px-5 py-3 font-mono">
                  {p.last_balance != null ? (
                    <span className={Number(p.last_balance) < Number(p.low_balance_threshold ?? 50) ? "text-amber" : "text-cyan"}>
                      ₺{Number(p.last_balance).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-mute">Henüz kontrol edilmedi</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => viewCatalog(p.id)} className="mr-4 text-xs text-cyan hover:underline">
                    Servis listesini gör
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-xs text-magenta hover:underline">
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {catalog && (
        <div className="rounded-xl border border-line bg-panel p-5">
          <h2 className="font-display font-semibold text-ink">Tedarikçi Servis Kataloğu</h2>
          <p className="mt-1 text-xs text-mute">
            Burada gördüğün <code>ID</code> değerini, Hizmetler sayfasında yeni hizmet eklerken "Tedarikçi Servis ID"
            alanına yapıştır.
          </p>
          {!catalog.services.length ? (
            <p className="mt-4 text-sm text-mute">Yükleniyor veya sonuç yok…</p>
          ) : (
            <div className="mt-4 max-h-96 overflow-y-auto rounded-lg border border-line">
              <table className="w-full text-left text-xs">
                <thead className="bg-panel2 text-mute">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Ad</th>
                    <th className="px-3 py-2">Min</th>
                    <th className="px-3 py-2">Maks</th>
                    <th className="px-3 py-2">Fiyat (tedarikçi)</th>
                  </tr>
                </thead>
                <tbody>
                  {catalog.services.map((s: any) => (
                    <tr key={s.service} className="border-t border-line">
                      <td className="px-3 py-2 font-mono text-mute">{s.service}</td>
                      <td className="px-3 py-2 text-ink">{s.name}</td>
                      <td className="px-3 py-2 text-mute">{s.min}</td>
                      <td className="px-3 py-2 text-mute">{s.max}</td>
                      <td className="px-3 py-2 text-mute">{s.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
