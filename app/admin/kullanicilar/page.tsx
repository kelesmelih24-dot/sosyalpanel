import { createAdminClient } from "@/lib/supabase/server";

export default async function AdminKullanicilarPage() {
  const admin = createAdminClient();
  const { data: users } = await admin.from("profiles").select("*").order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Yönetici Hesapları</h1>
        <p className="mt-1 text-mute">
          Panele giriş yapabilen hesaplar. Müşteriler artık üye olmadan (misafir + dekont ile) sipariş
          verdiği için burada sadece admin/yönetici hesapları listelenir.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-panel">
        <table className="w-full text-left text-sm">
          <thead className="text-mute">
            <tr>
              <th className="px-5 py-3 font-medium">E-posta</th>
              <th className="px-5 py-3 font-medium">Ad Soyad</th>
              <th className="px-5 py-3 font-medium">Rol</th>
              <th className="px-5 py-3 font-medium">Kayıt</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u: any) => (
              <tr key={u.id} className="border-t border-line">
                <td className="px-5 py-3 text-ink">{u.email}</td>
                <td className="px-5 py-3 text-mute">{u.full_name ?? "—"}</td>
                <td className="px-5 py-3 text-mute">{u.role}</td>
                <td className="px-5 py-3 text-mute">{new Date(u.created_at).toLocaleDateString("tr-TR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
