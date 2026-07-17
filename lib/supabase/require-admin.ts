import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false as const, status: 401, error: "Oturum açmalısın." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && profile?.role !== "destek") {
    return { ok: false as const, status: 403, error: "Yetkin yok." };
  }

  return { ok: true as const, user, role: profile.role as "admin" | "destek" };
}

// Stricter check for actions only a full admin can do (pricing, providers,
// deleting things) — "destek" role is limited to viewing/approving orders.
export async function requireFullAdmin() {
  const result = await requireAdmin();
  if (!result.ok) return result;
  if (result.role !== "admin") return { ok: false as const, status: 403, error: "Bu işlem için tam admin yetkisi gerekli." };
  return result;
}
