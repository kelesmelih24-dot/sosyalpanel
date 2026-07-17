"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Service = {
  id: number;
  name: string;
  description: string | null;
  min_quantity: number;
  max_quantity: number;
  price_per_1000: number;
};

export function ServiceCard({ service }: { service: Service }) {
  const router = useRouter();
  const defaultQty = Math.min(1000, service.max_quantity) >= service.min_quantity
    ? Math.min(1000, service.max_quantity)
    : service.min_quantity;
  const [quantity, setQuantity] = useState(defaultQty);
  const [touched, setTouched] = useState(false);

  const total = (quantity / 1000) * Number(service.price_per_1000);
  const isValid = quantity >= service.min_quantity && quantity <= service.max_quantity;

  function handleOrder() {
    setTouched(true);
    if (!isValid) return;
    router.push(`/misafir-siparis?service=${service.id}&quantity=${quantity}`);
  }

  function step(delta: number) {
    setQuantity((q) => {
      const next = q + delta;
      return Math.min(service.max_quantity, Math.max(service.min_quantity, next));
    });
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border2 bg-paper p-6 shadow-sm">
      <div className="font-display font-semibold text-slate">{service.name}</div>
      {service.description && <p className="mt-1 text-sm text-slateMute">{service.description}</p>}
      <div className="mt-3 text-xs text-slateMute">
        Min {service.min_quantity.toLocaleString("tr-TR")} — Maks {service.max_quantity.toLocaleString("tr-TR")}
      </div>
      <div className="mt-2 text-xs text-slateMute">
        ₺{Number(service.price_per_1000).toFixed(2)} / 1000 adet
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-medium text-slateMute">Miktar seç</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => step(-100)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border2 text-slate hover:bg-brandSoft"
            aria-label="Azalt"
          >
            −
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full rounded-lg border border-border2 bg-white px-2 py-1.5 text-center text-slate focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <button
            type="button"
            onClick={() => step(100)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border2 text-slate hover:bg-brandSoft"
            aria-label="Artır"
          >
            +
          </button>
        </div>
        {touched && !isValid && (
          <p className="mt-1 text-xs text-red-600">
            Miktar {service.min_quantity.toLocaleString("tr-TR")} — {service.max_quantity.toLocaleString("tr-TR")} arasında olmalı.
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-blush px-3 py-2">
        <span className="text-xs text-slateMute">Toplam</span>
        <span className="font-mono text-lg font-bold text-brand">₺{total.toFixed(2)}</span>
      </div>

      <button
        onClick={handleOrder}
        className="mt-3 rounded-full bg-brand px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-brandDark"
      >
        Sipariş Ver
      </button>
    </div>
  );
}
