import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminOverview() {
  const supabase = createClient();

  const { count: userCount } = await supabase.from("profiles").select("id", { count: "exact", head: true });
  const { count: orderCount } = await supabase.from("orders").select("id", { count: "exact", head: true });
  const { count: pendingTopups } = await supabase
    .from("topup_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  const { data: revenueRows } = await supabase.from("transactions").select("amount").eq("type", "order");
  const revenue = (revenueRows ?? []).reduce((s, r) => s + Math.abs(Number(r.amount)), 0);

  const { data: lowProviders } = await supabase
    .from("providers")
    .select("name, last_balance, low_balance_threshold")
    .eq("is_active", true)
    .not("last_balance", "is", null);
  const lowBalanceProviders = (lowProviders ?? []).filter(
    (p) => Number(p.last_balance) < Number(p.low_balance_threshold)
  );

  const cards = [
    { label: "Toplam Kullanıcı", value: userCount ?? 0, accent: "text-cyan" },
    { label: "Toplam Sipariş", value: orderCount ?? 0, accent: "text-magenta" },
    { label: "Bekleyen Bakiye Talebi", value: pendingTopups ?? 0, accent: "text-amber", href: "/admin/kullanicilar" },
    { label: "Toplam Ciro", value: `₺${revenue.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`, accent: "text-violet" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Genel Bakış</h1>

      {lowBalanceProviders.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-amber">
          ⚠️ Düşük tedarikçi bakiyesi:{" "}
          {lowBalanceProviders.map((p) => `${p.name} (₺${Number(p.last_balance).toFixed(2)})`).join(", ")}.{" "}
          <Link href="/admin/tedarikciler" className="underline">Tedarikçiler sayfasından bakiye yükle.</Link>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
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
