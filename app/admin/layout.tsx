import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-void">
      <Sidebar variant="admin" />
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-line px-8 py-4">
          <div>
            <p className="text-sm text-mute">Yönetim Paneli</p>
            <p className="font-display font-semibold text-ink">{user.email}</p>
          </div>
          <span className="rounded-full border border-magenta/40 bg-magenta/10 px-3 py-1 text-xs font-medium text-magenta">
            Admin
          </span>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
