"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Category = { id: number; name: string; platform: string };
type Service = {
  id: number;
  name: string;
  description: string | null;
  min_quantity: number;
  max_quantity: number;
  price_per_1000: number;
  category_id: number | null;
  is_active: boolean;
};

const empty = {
  name: "",
  description: "",
  category_id: "",
  min_quantity: 100,
  max_quantity: 10000,
  price_per_1000: 0,
  provider_id: "",
  provider_service_id: "",
};

export default function AdminHizmetlerPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [providers, setProviders] = useState<{ id: number; name: string }[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [newCategory, setNewCategory] = useState({ name: "", platform: "instagram" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const { data: cats } = await supabase.from("categories").select("*").order("sort_order");
    const { data: svcs } = await supabase.from("services").select("*").order("id", { ascending: false });
    setCategories(cats ?? []);
    setServices(svcs ?? []);
    const provRes = await fetch("/api/admin/providers");
    const provData = await provRes.json();
    setProviders(provData.providers ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newCategory, sort_order: categories.length + 1 }),
    });
    setNewCategory({ name: "", platform: "instagram" });
    load();
  }

  async function handleCreateService(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        category_id: form.category_id || null,
        provider_id: form.provider_id || null,
        provider_service_id: form.provider_service_id || null,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "Hizmet oluşturulamadı.");
    setForm(empty);
    load();
  }

  async function toggleActive(s: Service) {
    await fetch("/api/admin/services", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: s.id, is_active: !s.is_active }),
    });
    load();
  }

  async function deleteService(id: number) {
    if (!confirm("Bu hizmeti silmek istediğine emin misin?")) return;
    await fetch(`/api/admin/services?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Hizmetler</h1>
        <p className="mt-1 text-mute">Sattığın hizmetleri, fiyatları ve limitleri yönet.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleCreateService} className="flex flex-col gap-3 rounded-xl border border-line bg-panel p-5 lg:col-span-2">
          <h2 className="font-display font-semibold text-ink">Yeni hizmet ekle</h2>
          <input
            required
            placeholder="Hizmet adı"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
          />
          <textarea
            placeholder="Açıklama (opsiyonel)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
          />
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
          >
            <option value="">Kategori seç</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs text-mute">Min adet</label>
              <input
                type="number"
                value={form.min_quantity}
                onChange={(e) => setForm({ ...form, min_quantity: Number(e.target.value) })}
                className="w-full rounded-lg border border-line bg-void px-3 py-2 text-ink focus-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-mute">Maks adet</label>
              <input
                type="number"
                value={form.max_quantity}
                onChange={(e) => setForm({ ...form, max_quantity: Number(e.target.value) })}
                className="w-full rounded-lg border border-line bg-void px-3 py-2 text-ink focus-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-mute">₺ / 1000</label>
              <input
                type="number"
                step="0.01"
                value={form.price_per_1000}
                onChange={(e) => setForm({ ...form, price_per_1000: Number(e.target.value) })}
                className="w-full rounded-lg border border-line bg-void px-3 py-2 text-ink focus-ring"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-line bg-void/60 p-3">
            <div>
              <label className="mb-1 block text-xs text-mute">Tedarikçi (opsiyonel — otomatik iletim için)</label>
              <select
                value={form.provider_id}
                onChange={(e) => setForm({ ...form, provider_id: e.target.value })}
                className="w-full rounded-lg border border-line bg-void px-3 py-2 text-ink focus-ring"
              >
                <option value="">Manuel işlenecek (tedarikçi yok)</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {!providers.length && (
                <p className="mt-1 text-xs text-mute">
                  Henüz tedarikçi eklemedin. <a href="/admin/tedarikciler" className="text-cyan hover:underline">Tedarikçiler sayfasından ekle.</a>
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs text-mute">Tedarikçi Servis ID</label>
              <input
                placeholder="örn. 4512"
                value={form.provider_service_id}
                onChange={(e) => setForm({ ...form, provider_service_id: e.target.value })}
                className="w-full rounded-lg border border-line bg-void px-3 py-2 text-ink focus-ring"
              />
            </div>
          </div>
          {error && <p className="text-sm text-magenta">{error}</p>}
          <button
            disabled={loading}
            className="mt-1 self-start rounded-lg bg-gradient-to-r from-magenta to-violet px-4 py-2 text-sm font-semibold text-ink transition-transform hover:scale-[1.02] disabled:opacity-60 focus-ring"
          >
            {loading ? "Ekleniyor…" : "Hizmeti Ekle"}
          </button>
        </form>

        <form onSubmit={handleCreateCategory} className="flex flex-col gap-3 rounded-xl border border-line bg-panel p-5">
          <h2 className="font-display font-semibold text-ink">Yeni kategori</h2>
          <input
            required
            placeholder="Kategori adı"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            className="rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
          />
          <select
            value={newCategory.platform}
            onChange={(e) => setNewCategory({ ...newCategory, platform: e.target.value })}
            className="rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
          >
            {["instagram", "tiktok", "youtube", "twitter", "telegram", "diger"].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <button className="self-start rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-violet/60 focus-ring">
            Kategoriyi Ekle
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-panel">
        <table className="w-full text-left text-sm">
          <thead className="text-mute">
            <tr>
              <th className="px-5 py-3 font-medium">Hizmet</th>
              <th className="px-5 py-3 font-medium">Limit</th>
              <th className="px-5 py-3 font-medium">₺ / 1000</th>
              <th className="px-5 py-3 font-medium">Durum</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-t border-line">
                <td className="px-5 py-3 text-ink">{s.name}</td>
                <td className="px-5 py-3 text-mute">{s.min_quantity} – {s.max_quantity}</td>
                <td className="px-5 py-3 font-mono text-cyan">₺{Number(s.price_per_1000).toFixed(2)}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggleActive(s)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      s.is_active ? "bg-emerald-400/15 text-emerald-400" : "bg-mute/15 text-mute"
                    }`}
                  >
                    {s.is_active ? "Aktif" : "Pasif"}
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => deleteService(s.id)} className="text-xs text-magenta hover:underline">
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
