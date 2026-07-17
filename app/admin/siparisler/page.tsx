import { createAdminClient } from "@/lib/supabase/server";
import { AdminOrdersTable } from "@/components/AdminOrdersTable";

export default async function AdminSiparislerPage() {
  const admin = createAdminClient();
  const { data: orders } = await admin
    .from("orders")
    .select("id, link, quantity, charge, status, created_at, guest_email, dekont_url, invoice_url, profiles(email), services(name)")
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

      <div className="mt-6">
        <AdminOrdersTable orders={ordersWithDekont as any} />
      </div>
    </div>
  );
}
