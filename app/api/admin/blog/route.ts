import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireFullAdmin } from "@/lib/supabase/require-admin";

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export async function GET() {
  const check = await requireFullAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const admin = createAdminClient();
  const { data, error } = await admin.from("blog_posts").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ posts: data });
}

export async function POST(request: Request) {
  const check = await requireFullAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await request.json();
  const admin = createAdminClient();
  const slug = slugify(body.title) + "-" + Math.random().toString(36).slice(2, 6);
  const { data, error } = await admin
    .from("blog_posts")
    .insert({ ...body, slug })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ post: data });
}

export async function PATCH(request: Request) {
  const check = await requireFullAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const { id, ...updates } = await request.json();
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("blog_posts")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ post: data });
}

export async function DELETE(request: Request) {
  const check = await requireFullAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from("blog_posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
