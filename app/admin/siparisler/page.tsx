import { createAdminClient } from "@/lib/supabase/server";
import { OrderStatusSelect } from "@/components/OrderStatusSelect";

export default async function AdminSiparislerPage() {
  const admin = createAdminClient();
  const { data: orders } = await admin
    .from("orders")
    .select("id, link, quantity, charge, status, created_at, guest_email, dekont_url, profiles(email), services(name)")
    .order("created_at", { ascending: false })
    .limit(200);

  // Generate short-lived signed URLs for each uploaded receipt (bucket is private).
  const ordersWithDekont = await Promise.all(
    (orders ?? []).map(async (o: any) => {
      if (!o.dekont_url) return { ...o, dekontSignedUrl: null };
      const { data } = await admin.storage.from("dekontlar").createSignedUrl(o.dekont_url, 3600);
      return { ...o, dekontSignedUrl: data?.signedUrl ?? null };
    })
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Siparişler</h1>
      <p className="mt-1 text-mute">Tüm siparişleri görüntüle, dekontu kontrol et ve durumunu güncelle.</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-panel">
        <table className="w-full text-left text-sm">
          <thead className="text-mute">
            <tr>
              <th className="px-5 py-3 font-medium">#</th>
              <th className="px-5 py-3 font-medium">Kullanıcı</th>
              <th className="px-5 py-3 font-medium">Hizmet</th>
              <th className="px-5 py-3 font-medium">Miktar</th>
              <th className="px-5 py-3 font-medium">Tutar</th>
              <th className="px-5 py-3 font-medium">Dekont</th>
              <th className="px-5 py-3 font-medium">Durum</th>
            </tr>
          </thead>
          <tbody>
            {ordersWithDekont.map((o: any) => (
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
                  <OrderStatusSelect orderId={o.id} current={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
