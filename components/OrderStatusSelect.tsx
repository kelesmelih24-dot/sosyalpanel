"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = ["awaiting_payment", "pending", "processing", "in_progress", "completed", "partial", "canceled", "refunded"];
const labels: Record<string, string> = {
  awaiting_payment: "Ödeme Bekleniyor",
  pending: "Beklemede",
  processing: "İşleniyor",
  in_progress: "Devam Ediyor",
  completed: "Tamamlandı",
  partial: "Kısmi",
  canceled: "İptal",
  refunded: "İade",
};

export function OrderStatusSelect({ orderId, current }: { orderId: number; current: string }) {
  const router = useRouter();
  const [value, setValue] = useState(current);
  const [saving, setSaving] = useState(false);

  async function handleChange(next: string) {
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

  return (
    <select
      value={value}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-lg border border-line bg-void px-2 py-1.5 text-xs text-ink focus-ring disabled:opacity-50"
    >
      {statuses.map((s) => (
        <option key={s} value={s}>{labels[s]}</option>
      ))}
    </select>
  );
}
