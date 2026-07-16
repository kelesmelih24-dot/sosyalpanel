import { createClient } from "@/lib/supabase/server";

const statusLabel: Record<string, string> = {
  pending: "Beklemede",
  processing: "İşleniyor",
  in_progress: "Devam Ediyor",
  completed: "Tamamlandı",
  partial: "Kısmi",
  canceled: "İptal",
  refunded: "İade",
};

const statusColor: Record<string, string> = {
  pending: "text-amber",
  processing: "text-cyan",
  in_progress: "text-cyan",
  completed: "text-emerald-400",
  partial: "text-amber",
  canceled: "text-mute",
  refunded: "text-magenta",
};

export default async function SiparislerimPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, link, quantity, charge, status, created_at, services(name)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Siparişlerim</h1>
      <p className="mt-1 text-mute">Tüm sipariş geçmişin ve güncel durumları.</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-panel">
        {!orders?.length ? (
          <div className="px-5 py-10 text-center text-sm text-mute">Henüz bir sipariş vermedin.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-mute">
              <tr>
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-5 py-3 font-medium">Hizmet</th>
                <th className="px-5 py-3 font-medium">Link</th>
                <th className="px-5 py-3 font-medium">Miktar</th>
                <th className="px-5 py-3 font-medium">Tutar</th>
                <th className="px-5 py-3 font-medium">Durum</th>
                <th className="px-5 py-3 font-medium">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o: any) => (
                <tr key={o.id} className="border-t border-line">
                  <td className="px-5 py-3 font-mono text-mute">{o.id}</td>
                  <td className="px-5 py-3 text-ink">{o.services?.name ?? "—"}</td>
                  <td className="max-w-[200px] truncate px-5 py-3 text-mute">{o.link}</td>
                  <td className="px-5 py-3 text-mute">{o.quantity.toLocaleString("tr-TR")}</td>
                  <td className="px-5 py-3 font-mono text-mute">₺{Number(o.charge).toFixed(2)}</td>
                  <td className={`px-5 py-3 font-medium ${statusColor[o.status] ?? "text-mute"}`}>
                    {statusLabel[o.status] ?? o.status}
                  </td>
                  <td className="px-5 py-3 text-mute">{new Date(o.created_at).toLocaleDateString("tr-TR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
