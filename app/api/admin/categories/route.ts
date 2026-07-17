import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireFullAdmin } from "@/lib/supabase/require-admin";

export async function POST(request: Request) {
  const check = await requireFullAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await request.json();
  const admin = createAdminClient();
  const { data, error } = await admin.from("categories").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ category: data });
}
