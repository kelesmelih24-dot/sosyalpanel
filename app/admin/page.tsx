import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";

export default async function AdminOverview() {
  // Uses the service-role client (not the session-bound one) — RLS restricts
  // profiles/orders reads to "your own row", which would make these totals
  // wrong for anyone other than the querying admin's own account.
  const admin = createAdminClient();

  const { count: orderCount } = await admin.from("orders").select("id", { count: "exact", head: true });
  const { count: awaitingPaymentOrders } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "awaiting_payment");
  const { data: revenueRows } = await admin.from("transactions").select("amount").eq("type", "order");
  const revenue = (revenueRows ?? []).reduce((s: number, r: any) => s + Math.abs(Number(r.amount)), 0);

  const { data: lowProviders } = await admin
    .from("providers")
    .select("name, last_balance, low_balance_threshold")
    .eq("is_active", true)
    .not("last_balance", "is", null);
  const lowBalanceProviders: any[] = (lowProviders ?? []).filter(
    (p: any) => Number(p.last_balance) < Number(p.low_balance_threshold)
  );

  const cards = [
    { label: "Toplam Sipariş", value: orderCount ?? 0, accent: "text-magenta" },
    { label: "Onay Bekleyen Dekont", value: awaitingPaymentOrders ?? 0, accent: "text-amber", href: "/admin/siparisler" },
    { label: "Toplam Ciro", value: `₺${revenue.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`, accent: "text-violet" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Genel Bakış</h1>

      {(awaitingPaymentOrders ?? 0) > 0 && (
        <div className="mt-4 rounded-lg border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-amber">
          🧾 <strong>{awaitingPaymentOrders}</strong> sipariş dekont onayı bekliyor.{" "}
          <Link href="/admin/siparisler" className="underline">Siparişler sayfasından kontrol et.</Link>
        </div>
      )}

      {lowBalanceProviders.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-amber">
          ⚠️ Düşük tedarikçi bakiyesi:{" "}
          {lowBalanceProviders.map((p: any) => `${p.name} (₺${Number(p.last_balance).toFixed(2)})`).join(", ")}.{" "}
          <Link href="/admin/tedarikciler" className="underline">Tedarikçiler sayfasından bakiye yükle.</Link>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href ?? "#"}
            className="rounded-xl border border-line bg-panel p-5 transition-colors hover:border-violet/60"
          >
            <p className="text-xs uppercase tracking-wide text-mute">{c.label}</p>
            <p className={`mt-2 font-mono text-2xl font-semibold ${c.accent}`}>{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
