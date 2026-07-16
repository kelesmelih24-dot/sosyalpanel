import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/giris");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, balance, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen bg-void">
      <Sidebar variant="user" />
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-line px-8 py-4">
          <div>
            <p className="text-sm text-mute">Hoş geldin,</p>
            <p className="font-display font-semibold text-ink">{profile?.full_name || user.email}</p>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-line bg-panel px-4 py-2">
            <span className="text-xs uppercase tracking-wide text-mute">Bakiye</span>
            <span className="font-mono text-lg font-semibold text-cyan">
              ₺{Number(profile?.balance ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
