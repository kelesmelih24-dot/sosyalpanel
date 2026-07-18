"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const labels: Record<string, string> = {
  awaiting_payment: "Ödeme Bekleniyor",
  pending: "Beklemede",
  processing: "İşleniyor",
  in_progress: "Devam Ediyor",
  completed: "Tamamlandı",
  partial: "Kısmi",
  canceled: "İptal Edildi",
  refunded: "İade Edildi",
};

const badgeColor: Record<string, string> = {
  awaiting_payment: "bg-amber/15 text-amber",
  pending: "bg-cyan/15 text-cyan",
  processing: "bg-cyan/15 text-cyan",
  in_progress: "bg-cyan/15 text-cyan",
  completed: "bg-emerald-400/15 text-emerald-400",
  partial: "bg-emerald-400/15 text-emerald-400",
  canceled: "bg-mute/15 text-mute",
  refunded: "bg-mute/15 text-mute",
};

export function OrderStatusSelect({ orderId, current }: { orderId: number; current: string }) {
  const router = useRouter();
  const [value, setValue] = useState(current);
  const [saving, setSaving] = useState(false);

  async function setStatus(next: string) {
    setValue(next);
    setSaving(true);
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, status: next }),
    });
    setSaving(false);
    router.refresh();
  }

  // Once an order has moved past "awaiting_payment" (approved, canceled, or
  // further along), just show its status — no more accidental re-clicking.
  if (value !== "awaiting_payment") {
    return (
      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeColor[value] ?? "bg-mute/15 text-mute"}`}>
        {labels[value] ?? value}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => setStatus("pending")}
        disabled={saving}
        className="rounded-lg bg-emerald-400/15 px-2.5 py-1.5 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-400/25 disabled:opacity-50"
      >
        ✓ Onayla
      </button>
      <button
        onClick={() => setStatus("canceled")}
        disabled={saving}
        className="rounded-lg bg-magenta/15 px-2.5 py-1.5 text-xs font-semibold text-magenta transition-colors hover:bg-magenta/25 disabled:opacity-50"
      >
        ✕ İptal
      </button>
    </div>
  );
}
