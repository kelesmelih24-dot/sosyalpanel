import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { sendEmail, orderStatusEmail, referralRewardEmail } from "@/lib/email";
import { providerPlaceOrder } from "@/lib/smmProvider";
import { grantReferralRewardIfCompleted } from "@/lib/referrals";
import { REFERRAL_DISCOUNT_PERCENT } from "@/lib/constants";

export async function PATCH(request: Request) {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const { id, status, start_count, remains } = await request.json();
  if (!id || !status) return NextResponse.json({ error: "id ve status gerekli" }, { status: 400 });

  const admin = createAdminClient();

  const { data: previous } = await admin
    .from("orders")
    .select("status, charge, user_id, guest_email, link, quantity, service_id, services(name, provider_id, provider_service_id, providers(api_url, api_key)), profiles(email)")
    .eq("id", id)
    .single();
  if (!previous) return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });

  const wasAlreadyClosed = previous.status === "refunded" || previous.status === "canceled";

  const { data, error } = await admin
    .from("orders")
    .update({ status, start_count, remains, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Only credit the balance back for MEMBER orders (guest/misafir orders have no
  // account balance — their refund is a real-money process handled outside the app).
  // Only the first time an order becomes refunded/canceled — toggling the status
  // again later must never trigger a second refund.
  if (previous.user_id && (status === "refunded" || status === "canceled") && !wasAlreadyClosed) {
    await admin.rpc("admin_adjust_balance", {
      p_user_id: previous.user_id,
      p_amount: data.charge,
      p_note: `Sipariş #${id} iadesi`,
    });
  }

  // Guest order payment just got confirmed (awaiting_payment -> pending): forward
  // to the upstream provider now, same as a member order does immediately at checkout.
  const service = (previous as any).services;
  if (previous.status === "awaiting_payment" && status === "pending" && service?.provider_id && service?.provider_service_id) {
    try {
      const { providerOrderId } = await providerPlaceOrder(service.providers, {
        providerServiceId: service.provider_service_id,
        link: previous.link,
        quantity: previous.quantity,
      });
      await admin
        .from("orders")
        .update({ status: "processing", provider_order_id: providerOrderId })
        .eq("id", id);
    } catch (e: any) {
      await admin.from("orders").update({ provider_error: e.message ?? "Tedarikçiye iletilemedi" }).eq("id", id);
    }
  }

  const customerEmail = (previous as any).profiles?.email ?? previous.guest_email;
  const serviceName = service?.name ?? "Hizmet";
  if (customerEmail && previous.status !== status && ["completed", "partial", "canceled", "refunded"].includes(status)) {
    const { subject, html } = orderStatusEmail({ orderId: id, serviceName, status });
    await sendEmail(customerEmail, subject, html);
  }

  if (status === "completed" && previous.status !== "completed") {
    const reward = await grantReferralRewardIfCompleted(admin, id);
    if (reward) {
      const { subject, html } = referralRewardEmail({ code: reward.code, percent: REFERRAL_DISCOUNT_PERCENT });
      await sendEmail(reward.referrerEmail, subject, html);
    }
  }

  return NextResponse.json({ order: data });
}
