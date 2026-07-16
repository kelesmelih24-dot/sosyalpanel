import { createAdminClient } from "@/lib/supabase/server";
import { TopupActions } from "@/components/TopupActions";

export default async function AdminKullanicilarPage() {
  const admin = createAdminClient();
  const { data: users } = await admin.from("profiles").select("*").order("created_at", { ascending: false });
  const { data: requests } = await admin
    .from("topup_requests")
    .select("*, profiles(email)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Kullanıcılar</h1>
        <p className="mt-1 text-mute">Bekleyen bakiye talepleri ve tüm üyeler.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-panel">
        <div className="border-b border-line px-5 py-3">
          <h2 className="font-display font-semibold text-ink">Bekleyen Bakiye Talepleri</h2>
        </div>
        {!requests?.length ? (
          <p className="px-5 py-6 text-sm text-mute">Bekleyen talep yok.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-mute">
              <tr>
                <th className="px-5 py-3 font-medium">Kullanıcı</th>
                <th className="px-5 py-3 font-medium">Tutar</th>
                <th className="px-5 py-3 font-medium">Yöntem</th>
                <th className="px-5 py-3 font-medium">Not</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r: any) => (
                <tr key={r.id} className="border-t border-line">
                  <td className="px-5 py-3 text-ink">{r.profiles?.email}</td>
                  <td className="px-5 py-3 font-mono text-cyan">₺{Number(r.amount).toFixed(2)}</td>
                  <td className="px-5 py-3 text-mute">{r.method}</td>
                  <td className="px-5 py-3 text-mute">{r.reference_note ?? "—"}</td>
                  <td className="px-5 py-3"><TopupActions requestId={r.id} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-panel">
        <div className="border-b border-line px-5 py-3">
          <h2 className="font-display font-semibold text-ink">Tüm Üyeler</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="text-mute">
            <tr>
              <th className="px-5 py-3 font-medium">E-posta</th>
              <th className="px-5 py-3 font-medium">Ad Soyad</th>
              <th className="px-5 py-3 font-medium">Bakiye</th>
              <th className="px-5 py-3 font-medium">Rol</th>
              <th className="px-5 py-3 font-medium">Kayıt</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u: any) => (
              <tr key={u.id} className="border-t border-line">
                <td className="px-5 py-3 text-ink">{u.email}</td>
                <td className="px-5 py-3 text-mute">{u.full_name ?? "—"}</td>
                <td className="px-5 py-3 font-mono text-cyan">₺{Number(u.balance).toFixed(2)}</td>
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
