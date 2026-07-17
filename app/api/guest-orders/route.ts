import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { service_id, link, quantity, guest_email, payment_method } = await request.json();

  if (!service_id || !link || !quantity || !guest_email) {
    return NextResponse.json({ error: "Eksik alan var." }, { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(guest_email)) {
    return NextResponse.json({ error: "Geçerli bir e-posta gir." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Basic abuse guard: max 5 guest orders per email per rolling 10 minutes.
  const tenMinAgo = new Date(Date.now() - 10 * 60_000).toISOString();
  const { count } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("guest_email", guest_email)
    .gte("created_at", tenMinAgo);
  if ((count ?? 0) >= 5) {
    return NextResponse.json({ error: "Çok fazla sipariş talebi gönderdin, lütfen biraz bekle." }, { status: 429 });
  }

  const { data: service } = await admin
    .from("services")
    .select("id, min_quantity, max_quantity, price_per_1000, is_active")
    .eq("id", service_id)
    .single();

  if (!service || !service.is_active) {
    return NextResponse.json({ error: "Hizmet bulunamadı veya pasif." }, { status: 400 });
  }
  if (quantity < service.min_quantity || quantity > service.max_quantity) {
    return NextResponse.json(
      { error: `Miktar ${service.min_quantity} ile ${service.max_quantity} arasında olmalı.` },
      { status: 400 }
    );
  }

  const charge = Math.round((quantity / 1000) * Number(service.price_per_1000) * 100) / 100;

  const { data: order, error } = await admin
    .from("orders")
    .insert({
      service_id,
      link,
      quantity,
      charge,
      guest_email,
      payment_method: payment_method ?? "havale",
      status: "awaiting_payment",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ order });
}
