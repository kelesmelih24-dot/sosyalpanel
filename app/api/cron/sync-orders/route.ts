import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { providerOrderStatus, providerBalance, normalizeProviderStatus } from "@/lib/smmProvider";
import { sendEmail, orderStatusEmail, referralRewardEmail } from "@/lib/email";
import { sendAlert } from "@/lib/alert";
import { grantReferralRewardIfCompleted } from "@/lib/referrals";
import { REFERRAL_DISCOUNT_PERCENT } from "@/lib/constants";

// Protect this with a secret so only your external scheduler (see README —
// Vercel Hobby only allows daily cron, so we use cron-job.org for real
// frequency) can trigger it: `Authorization: Bearer <CRON_SECRET>`.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const admin = createAdminClient();

  // ---- 1) Sync order statuses from each provider ----
  const { data: orders } = await admin
    .from("orders")
    .select(
      "id, status, charge, user_id, guest_email, provider_order_id, services(name, provider_id, providers(id, api_url, api_key)), profiles(email)"
    )
    .in("status", ["processing", "in_progress"])
    .not("provider_order_id", "is", null)
    .limit(100);

  let updated = 0;
  for (const o of orders ?? []) {
    const providerCreds = (o as any).services?.providers;
    if (!providerCreds) continue;
    try {
      const result = await providerOrderStatus(providerCreds, o.provider_order_id as string);
      const newStatus = normalizeProviderStatus(result.status);
      const wasAlreadyClosed = o.status === "refunded" || o.status === "canceled";

      await admin
        .from("orders")
        .update({
          status: newStatus,
          start_count: result.startCount,
          remains: result.remains,
          updated_at: new Date().toISOString(),
        })
        .eq("id", o.id);

      // Balance refund only applies to MEMBER orders (guest orders have no
      // account balance — their refund is a real-money process outside the app).
      if (o.user_id && (newStatus === "refunded" || newStatus === "canceled") && !wasAlreadyClosed) {
        await admin.rpc("admin_adjust_balance", {
          p_user_id: o.user_id,
          p_amount: o.charge,
          p_note: `Sipariş #${o.id} tedarikçi tarafından iptal/iade edildi`,
        });
      }

      const customerEmail = (o as any).profiles?.email ?? o.guest_email;
      const serviceName = (o as any).services?.name ?? "Hizmet";
      if (customerEmail && o.status !== newStatus && ["completed", "partial", "canceled", "refunded"].includes(newStatus)) {
        const { subject, html } = orderStatusEmail({ orderId: o.id, serviceName, status: newStatus });
        await sendEmail(customerEmail, subject, html);
      }

      if (newStatus === "completed" && o.status !== "completed") {
        const reward = await grantReferralRewardIfCompleted(admin, o.id);
        if (reward) {
          const { subject, html } = referralRewardEmail({ code: reward.code, percent: REFERRAL_DISCOUNT_PERCENT });
          await sendEmail(reward.referrerEmail, subject, html);
        }
      }

      updated++;
    } catch {
      // leave as-is, will retry next run
    }
  }

  // ---- 2) Check provider balances and alert if running low ----
  const { data: providers } = await admin
    .from("providers")
    .select("id, name, api_url, api_key, low_balance_threshold")
    .eq("is_active", true);

  for (const p of providers ?? []) {
    try {
      const { balance, currency } = await providerBalance(p as any);
      await admin
        .from("providers")
        .update({ last_balance: balance, last_balance_checked_at: new Date().toISOString() })
        .eq("id", p.id);

      if (balance < Number(p.low_balance_threshold)) {
        await sendAlert(
          `⚠️ Tedarikçi bakiyesi düşük: "${p.name}" — kalan ${balance} ${currency ?? ""}. Panelden bakiye yükle.`
        );
      }
    } catch {
      // provider may not support the `balance` action — safe to skip
    }
  }

  return NextResponse.json({ checked: orders?.length ?? 0, updated });
}
