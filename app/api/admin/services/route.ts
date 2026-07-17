import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireFullAdmin } from "@/lib/supabase/require-admin";

// Admin needs to see inactive services too, which the public RLS policy
// (services_public_read: is_active = true) intentionally hides from
// ordinary browser queries — so this always goes through the admin client.
export async function GET() {
  const check = await requireFullAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const admin = createAdminClient();
  const { data, error } = await admin.from("services").select("*").order("id", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ services: data });
}

export async function POST(request: Request) {
  const check = await requireFullAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await request.json();
  const admin = createAdminClient();
  const { data, error } = await admin.from("services").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ service: data });
}

export async function PATCH(request: Request) {
  const check = await requireFullAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const { id, ...updates } = await request.json();
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin.from("services").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ service: data });
}

export async function DELETE(request: Request) {
  const check = await requireFullAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from("services").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
