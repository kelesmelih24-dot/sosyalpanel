"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Service = {
  id: number;
  name: string;
  description: string | null;
  min_quantity: number;
  max_quantity: number;
  price_per_1000: number;
  category_id: number | null;
};

type Category = { id: number; name: string; platform: string };

export default function SiparisVerPage() {
  const supabase = createClient();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: cats } = await supabase.from("categories").select("id, name, platform").order("sort_order");
      const { data: svcs } = await supabase
        .from("services")
        .select("id, name, description, min_quantity, max_quantity, price_per_1000, category_id")
        .eq("is_active", true);
      setCategories(cats ?? []);
      setServices(svcs ?? []);
    }
    load();
  }, []);

  const filteredServices = useMemo(
    () => (categoryId ? services.filter((s) => s.category_id === categoryId) : services),
    [services, categoryId]
  );
  const selectedService = services.find((s) => s.id === serviceId) ?? null;
  const charge = selectedService ? (quantity / 1000) * Number(selectedService.price_per_1000) : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!selectedService) return setError("Lütfen bir hizmet seç.");
    if (quantity < selectedService.min_quantity || quantity > selectedService.max_quantity) {
      return setError(`Miktar ${selectedService.min_quantity} ile ${selectedService.max_quantity} arasında olmalı.`);
    }
    if (!link.trim()) return setError("Lütfen hedef linki gir.");

    setSubmitting(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service_id: selectedService.id, link, quantity }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? "Sipariş oluşturulamadı.");
      return;
    }
    setSuccess("Siparişin başarıyla oluşturuldu.");
    setLink("");
    setQuantity(0);
    router.refresh();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-ink">Sipariş Ver</h1>
      <p className="mt-1 text-mute">Platform, hizmet ve hedef linki seçerek yeni sipariş oluştur.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5 rounded-xl border border-line bg-panel p-6">
        <div>
          <label className="mb-1.5 block text-sm text-mute">Kategori</label>
          <select
            value={categoryId ?? ""}
            onChange={(e) => {
              setCategoryId(e.target.value ? Number(e.target.value) : null);
              setServiceId(null);
            }}
            className="w-full rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
          >
            <option value="">Tüm kategoriler</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-mute">Hizmet</label>
          <select
            value={serviceId ?? ""}
            onChange={(e) => setServiceId(e.target.value ? Number(e.target.value) : null)}
            className="w-full rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
          >
            <option value="">Hizmet seç</option>
            {filteredServices.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — ₺{Number(s.price_per_1000).toFixed(2)} / 1000
              </option>
            ))}
          </select>
          {selectedService?.description && (
            <p className="mt-1.5 text-xs text-mute">{selectedService.description}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-mute">Hedef Link</label>
          <input
            type="url"
            required
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://instagram.com/kullaniciadi"
            className="w-full rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-mute">
            Miktar {selectedService && <span className="text-xs">(min {selectedService.min_quantity} — maks {selectedService.max_quantity})</span>}
          </label>
          <input
            type="number"
            required
            value={quantity || ""}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full rounded-lg border border-line bg-void px-3.5 py-2.5 text-ink focus-ring"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-line bg-void px-4 py-3">
          <span className="text-sm text-mute">Toplam Tutar</span>
          <span className="font-mono text-lg font-semibold text-cyan">₺{charge.toFixed(2)}</span>
        </div>

        {error && <p className="text-sm text-magenta">{error}</p>}
        {success && <p className="text-sm text-emerald-400">{success}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-gradient-to-r from-magenta to-violet px-4 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.02] disabled:opacity-60 focus-ring"
        >
          {submitting ? "Gönderiliyor…" : "Siparişi Onayla"}
        </button>
      </form>
    </div>
  );
}
