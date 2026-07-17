import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { SimpleBarChart } from "@/components/SimpleBarChart";

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

  // ---- Last 14 days revenue chart (computed client-side from raw orders) ----
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentOrders } = await admin
    .from("orders")
    .select("charge, created_at, service_id, services(name)")
    .gte("created_at", fourteenDaysAgo)
    .not("status", "eq", "awaiting_payment")
    .limit(2000);

  const dayBuckets: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    dayBuckets[d.toISOString().slice(0, 10)] = 0;
  }
  const serviceCounts: Record<string, { name: string; count: number }> = {};
  for (const o of recentOrders ?? []) {
    const day = (o as any).created_at.slice(0, 10);
    if (day in dayBuckets) dayBuckets[day] += Number(o.charge);
    const name = (o as any).services?.name ?? "—";
    serviceCounts[name] = serviceCounts[name] || { name, count: 0 };
    serviceCounts[name].count++;
  }
  const chartData = Object.entries(dayBuckets).map(([day, value]) => ({
    label: new Date(day).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" }),
    value,
  }));
  const bestSellers = Object.values(serviceCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

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

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-line bg-panel p-5 lg:col-span-2">
          <h2 className="font-display font-semibold text-ink">Son 14 Gün Ciro</h2>
          <div className="mt-4">
            <SimpleBarChart data={chartData} />
          </div>
        </div>
        <div className="rounded-xl border border-line bg-panel p-5">
          <h2 className="font-display font-semibold text-ink">En Çok Satanlar</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {bestSellers.map((s, i) => (
              <li key={s.name} className="flex items-center justify-between text-sm">
                <span className="text-mute">{i + 1}. {s.name}</span>
                <span className="font-mono text-cyan">{s.count}</span>
              </li>
            ))}
            {!bestSellers.length && <li className="text-sm text-mute">Henüz veri yok.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
