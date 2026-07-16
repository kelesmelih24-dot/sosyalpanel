import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { providerPlaceOrder } from "@/lib/smmProvider";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Oturum açmalısın." }, { status: 401 });
  }

  const body = await request.json();
  const { service_id, link, quantity } = body ?? {};

  if (!service_id || !link || !quantity) {
    return NextResponse.json({ error: "Eksik alan var." }, { status: 400 });
  }

  const { data: order, error } = await supabase.rpc("place_order", {
    p_service_id: service_id,
    p_link: link,
    p_quantity: quantity,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Balance is already deducted at this point. Forward the order to the
  // upstream provider if this service has one configured; if it fails we
  // keep the order as "pending" with the error noted so an admin can retry
  // or refund it manually — we never silently lose the user's money.
  const admin = createAdminClient();
  const { data: service } = await admin
    .from("services")
    .select("provider_id, provider_service_id, providers(api_url, api_key)")
    .eq("id", service_id)
    .single();

  if (service?.provider_id && service.provider_service_id && service.providers) {
    try {
      const { providerOrderId } = await providerPlaceOrder(service.providers as any, {
        providerServiceId: service.provider_service_id,
        link,
        quantity,
      });
      await admin
        .from("orders")
        .update({ status: "processing", provider_order_id: providerOrderId })
        .eq("id", order.id);
      order.status = "processing";
      order.provider_order_id = providerOrderId;
    } catch (e: any) {
      await admin
        .from("orders")
        .update({ provider_error: e.message ?? "Tedarikçiye iletilemedi" })
        .eq("id", order.id);
    }
  }

  return NextResponse.json({ order });
}

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Oturum açmalısın." }, { status: 401 });

  const { data, error } = await supabase
    .from("orders")
    .select("id, link, quantity, charge, status, created_at, services(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ orders: data });
}

