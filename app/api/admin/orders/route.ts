import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { sendEmail, orderStatusEmail } from "@/lib/email";

export async function PATCH(request: Request) {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const { id, status, start_count, remains } = await request.json();
  if (!id || !status) return NextResponse.json({ error: "id ve status gerekli" }, { status: 400 });

  const admin = createAdminClient();

  const { data: previous } = await admin
    .from("orders")
    .select("status, charge, user_id, services(name), profiles(email)")
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

  // Only credit the balance back the first time an order becomes refunded/canceled —
  // toggling the status again later must never trigger a second refund.
  if ((status === "refunded" || status === "canceled") && !wasAlreadyClosed) {
    await admin.rpc("admin_adjust_balance", {
      p_user_id: data.user_id,
      p_amount: data.charge,
      p_note: `Sipariş #${id} iadesi`,
    });
  }

  const customerEmail = (previous as any).profiles?.email;
  const serviceName = (previous as any).services?.name ?? "Hizmet";
  if (customerEmail && previous.status !== status && ["completed", "partial", "canceled", "refunded"].includes(status)) {
    const { subject, html } = orderStatusEmail({ orderId: id, serviceName, status });
    await sendEmail(customerEmail, subject, html);
  }

  return NextResponse.json({ order: data });
}
