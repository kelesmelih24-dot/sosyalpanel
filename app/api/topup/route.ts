import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Oturum açmalısın." }, { status: 401 });

  const { amount, method, reference_note } = await request.json();
  if (!amount || Number(amount) <= 0) {
    return NextResponse.json({ error: "Geçerli bir tutar gir." }, { status: 400 });
  }

  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
  const { count } = await supabase
    .from("topup_requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", oneMinuteAgo);
  if ((count ?? 0) >= 5) {
    return NextResponse.json({ error: "Çok fazla talep gönderdin, lütfen biraz bekle." }, { status: 429 });
  }

  const { error } = await supabase.from("topup_requests").insert({
    user_id: user.id,
    amount,
    method: method ?? "havale",
    reference_note: reference_note ?? null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
