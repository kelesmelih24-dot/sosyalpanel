import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { providerServiceList } from "@/lib/smmProvider";

export async function GET() {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const admin = createAdminClient();
  // Don't leak api_key to the client — select everything except it.
  const { data, error } = await admin.from("providers").select("id, name, api_url, is_active, last_balance, low_balance_threshold, created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ providers: data });
}

export async function POST(request: Request) {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await request.json();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("providers")
    .insert({ name: body.name, api_url: body.api_url, api_key: body.api_key })
    .select("id, name, api_url, is_active, created_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ provider: data });
}

export async function DELETE(request: Request) {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from("providers").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

// Fetches the provider's live service catalog so an admin can look up
// the right provider_service_id when creating a service in our panel.
export async function PUT(request: Request) {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const { id } = await request.json();
  const admin = createAdminClient();
  const { data: provider } = await admin.from("providers").select("api_url, api_key").eq("id", id).single();
  if (!provider) return NextResponse.json({ error: "Tedarikçi bulunamadı" }, { status: 404 });

  try {
    const list = await providerServiceList(provider as any);
    return NextResponse.json({ services: list });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
