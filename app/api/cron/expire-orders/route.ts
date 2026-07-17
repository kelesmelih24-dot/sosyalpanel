import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail, paymentReminderEmail, orderExpiredEmail } from "@/lib/email";
import { sendTelegramMessage } from "@/lib/telegram";

// Run this every 30-60 minutes via Vercel Cron / cron-job.org.
// Protect with CRON_SECRET the same way as /api/cron/sync-orders.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = Date.now();

  // ---- 1) 12h reminder for orders still awaiting payment ----
  const twelveHoursAgo = new Date(now - 12 * 60 * 60 * 1000).toISOString();
  const twentyThreeHoursAgo = new Date(now - 23 * 60 * 60 * 1000).toISOString();

  const { data: needReminder } = await admin
    .from("orders")
    .select("id, charge, guest_email, upload_token, services(name)")
    .eq("status", "awaiting_payment")
    .is("reminder_sent_at", null)
    .lte("created_at", twelveHoursAgo)
    .gte("created_at", twentyThreeHoursAgo)
    .limit(100);

  let reminded = 0;
  for (const o of needReminder ?? []) {
    const uploadUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/misafir-siparis/dekont?order=${o.id}&token=${o.upload_token}`;
    const serviceName = (o as any).services?.name ?? "Hizmet";
    if (o.guest_email) {
      const { subject, html } = paymentReminderEmail({ orderId: o.id, serviceName, amount: Number(o.charge), uploadUrl });
      await sendEmail(o.guest_email, subject, html);
    }
    // TODO: also send via WhatsApp once a WhatsApp Business API provider is
    // configured (Twilio or Meta Cloud API) — see README for setup notes.
    await admin.from("orders").update({ reminder_sent_at: new Date().toISOString() }).eq("id", o.id);
    reminded++;
  }

  // ---- 2) Auto-cancel orders still awaiting payment after 24h ----
  const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const { data: expired } = await admin
    .from("orders")
    .select("id, guest_email, services(name)")
    .eq("status", "awaiting_payment")
    .lte("created_at", twentyFourHoursAgo)
    .limit(100);

  let canceled = 0;
  for (const o of expired ?? []) {
    await admin.from("orders").update({ status: "canceled" }).eq("id", o.id);
    const serviceName = (o as any).services?.name ?? "Hizmet";
    if (o.guest_email) {
      const { subject, html } = orderExpiredEmail({ orderId: o.id, serviceName });
      await sendEmail(o.guest_email, subject, html);
    }
    canceled++;
  }

  // ---- 3) High-volume alert: warn admin if weekly order count crosses 1000 ----
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: weeklyCount } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .gte("created_at", sevenDaysAgo);
  if ((weeklyCount ?? 0) >= 1000) {
    await sendTelegramMessage(
      `📈 <b>Yüksek sipariş hacmi uyarısı</b>\nSon 7 günde ${weeklyCount} sipariş alındı. Tedarikçi kapasitesini kontrol et.`
    );
  }

  return NextResponse.json({ reminded, canceled, weeklyCount });
}
