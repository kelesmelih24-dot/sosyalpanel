"use client";

import { useMemo, useState } from "react";
import { OrderStatusSelect } from "@/components/OrderStatusSelect";

type Order = {
  id: number;
  quantity: number;
  charge: number;
  status: string;
  guest_email: string | null;
  invoice_url?: string | null;
  profiles: { email: string } | null;
  services: { name: string } | null;
  dekontSignedUrl: string | null;
};

function InvoiceUpload({ orderId, hasInvoice }: { orderId: number; hasInvoice: boolean }) {
  const [busy, setBusy] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const fd = new FormData();
    fd.append("order_id", String(orderId));
    fd.append("invoice", file);
    await fetch("/api/admin/invoice", { method: "POST", body: fd });
    setBusy(false);
    window.location.reload();
  }

  return (
    <label className={`cursor-pointer text-xs ${hasInvoice ? "text-emerald-400" : "text-cyan"} hover:underline`}>
      {busy ? "Yükleniyor…" : hasInvoice ? "✓ Fatura Var" : "Fatura Yükle"}
      <input type="file" accept="application/pdf" className="hidden" onChange={handleFile} disabled={busy} />
    </label>
  );
}

export function AdminOrdersTable({ orders }: { orders: Order[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return orders;
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      const email = o.profiles?.email ?? o.guest_email ?? "";
      return String(o.id).includes(q) || email.toLowerCase().includes(q) || (o.services?.name ?? "").toLowerCase().includes(q);
    });
  }, [orders, query]);

  function exportCsv() {
    const header = ["Sipariş No", "E-posta", "Hizmet", "Miktar", "Tutar", "Durum"];
    const rows = filtered.map((o) => [
      o.id,
      o.profiles?.email ?? o.guest_email ?? "",
      o.services?.name ?? "",
      o.quantity,
      Number(o.charge).toFixed(2),
      o.status,
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `siparisler-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="E-posta, sipariş no veya hizmet ara…"
          className="w-full max-w-sm rounded-lg border border-line bg-void px-3.5 py-2 text-sm text-ink focus-ring"
        />
        <button
          onClick={exportCsv}
          className="shrink-0 rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-violet/60"
        >
          ⬇ CSV İndir
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-panel">
        <table className="w-full text-left text-sm">
          <thead className="text-mute">
            <tr>
              <th className="px-5 py-3 font-medium">#</th>
              <th className="px-5 py-3 font-medium">Kullanıcı</th>
              <th className="px-5 py-3 font-medium">Hizmet</th>
              <th className="px-5 py-3 font-medium">Miktar</th>
              <th className="px-5 py-3 font-medium">Tutar</th>
              <th className="px-5 py-3 font-medium">Dekont</th>
              <th className="px-5 py-3 font-medium">Fatura</th>
              <th className="px-5 py-3 font-medium">Durum</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-line">
                <td className="px-5 py-3 font-mono text-mute">{o.id}</td>
                <td className="px-5 py-3 text-mute">
                  {o.profiles?.email ?? (
                    <span>
                      {o.guest_email}{" "}
                      <span className="rounded-full bg-amber/15 px-2 py-0.5 text-[10px] font-medium text-amber">misafir</span>
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-ink">{o.services?.name ?? "—"}</td>
                <td className="px-5 py-3 text-mute">{o.quantity.toLocaleString("tr-TR")}</td>
                <td className="px-5 py-3 font-mono text-mute">₺{Number(o.charge).toFixed(2)}</td>
                <td className="px-5 py-3">
                  {o.dekontSignedUrl ? (
                    <a href={o.dekontSignedUrl} target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline">
                      Dekontu Gör
                    </a>
                  ) : (
                    <span className="text-mute">—</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <InvoiceUpload orderId={o.id} hasInvoice={!!o.invoice_url} />
                </td>
                <td className="px-5 py-3">
                  <OrderStatusSelect orderId={o.id} current={o.status} />
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-mute">Sonuç bulunamadı.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
