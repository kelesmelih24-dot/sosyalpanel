import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const statusLabel: Record<string, string> = {
  awaiting_payment: "Ödeme Bekleniyor",
  pending: "Beklemede",
  processing: "İşleniyor",
  in_progress: "Devam Ediyor",
  completed: "Tamamlandı",
  partial: "Kısmi",
  canceled: "İptal",
  refunded: "İade",
};

const statusColor: Record<string, string> = {
  awaiting_payment: "text-amber",
  pending: "text-amber",
  processing: "text-cyan",
  in_progress: "text-cyan",
  completed: "text-emerald-400",
  partial: "text-amber",
  canceled: "text-mute",
  refunded: "text-magenta",
};

export default async function DashboardHome() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, link, quantity, charge, status, created_at, services(name)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(8);

  const { count: totalOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user!.id);

  const { data: spendRows } = await supabase
    .from("transactions")
    .select("amount")
    .eq("user_id", user!.id)
    .eq("type", "order");

  const totalSpend = (spendRows ?? []).reduce((sum, r) => sum + Math.abs(Number(r.amount)), 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-panel p-5">
          <p className="text-xs uppercase tracking-wide text-mute">Toplam Sipariş</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-ink">{totalOrders ?? 0}</p>
        </div>
        <div className="rounded-xl border border-line bg-panel p-5">
          <p className="text-xs uppercase tracking-wide text-mute">Toplam Harcama</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-magenta">
            ₺{totalSpend.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <Link href="/dashboard/siparis-ver" className="flex flex-col justify-between rounded-xl border border-line bg-gradient-to-br from-magenta/20 to-violet/20 p-5 transition-transform hover:scale-[1.01]">
          <p className="text-xs uppercase tracking-wide text-mute">Hızlı işlem</p>
          <p className="mt-2 font-display font-semibold text-ink">+ Yeni Sipariş Ver</p>
        </Link>
      </div>

      <div className="rounded-xl border border-line bg-panel">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display font-semibold text-ink">Son Siparişler</h2>
          <Link href="/dashboard/siparislerim" className="text-sm text-cyan hover:underline">Tümünü gör</Link>
        </div>
        {!orders?.length ? (
          <div className="px-5 py-10 text-center text-sm text-mute">
            Henüz siparişin yok. <Link href="/dashboard/siparis-ver" className="text-cyan hover:underline">İlk siparişini ver.</Link>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-mute">
              <tr>
                <th className="px-5 py-3 font-medium">Hizmet</th>
                <th className="px-5 py-3 font-medium">Miktar</th>
                <th className="px-5 py-3 font-medium">Tutar</th>
                <th className="px-5 py-3 font-medium">Durum</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o: any) => (
                <tr key={o.id} className="border-t border-line">
                  <td className="px-5 py-3 text-ink">{o.services?.name ?? "—"}</td>
                  <td className="px-5 py-3 text-mute">{o.quantity.toLocaleString("tr-TR")}</td>
                  <td className="px-5 py-3 font-mono text-mute">₺{Number(o.charge).toFixed(2)}</td>
                  <td className={`px-5 py-3 font-medium ${statusColor[o.status] ?? "text-mute"}`}>
                    {statusLabel[o.status] ?? o.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
