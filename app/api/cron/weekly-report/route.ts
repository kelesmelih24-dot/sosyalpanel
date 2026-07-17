import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendTelegramMessage } from "@/lib/telegram";
import { sendEmail } from "@/lib/email";

// Runs daily (see vercel.json) but only sends the report on Mondays, so you
// get a genuinely weekly summary without needing more-than-once-a-day cron
// (which Vercel's free Hobby plan doesn't allow).
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const isMonday = new Date().getDay() === 1;
  const force = new URL(request.url).searchParams.get("force") === "1";
  if (!isMonday && !force) {
    return NextResponse.json({ skipped: true, reason: "Bugün Pazartesi değil." });
  }

  const admin = createAdminClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: orders } = await admin
    .from("orders")
    .select("charge, status")
    .gte("created_at", sevenDaysAgo);

  const total = (orders ?? []).length;
  const completed = (orders ?? []).filter((o: any) => o.status === "completed").length;
  const revenue = (orders ?? [])
    .filter((o: any) => !["awaiting_payment", "canceled", "refunded"].includes(o.status))
    .reduce((s: number, o: any) => s + Number(o.charge), 0);

  const message =
    `📊 <b>Haftalık Satış Raporu</b>\n` +
    `Son 7 gün:\n` +
    `Toplam sipariş: ${total}\n` +
    `Tamamlanan: ${completed}\n` +
    `Ciro: ₺${revenue.toFixed(2)}`;

  await sendTelegramMessage(message);

  const adminEmail = process.env.ADMIN_REPORT_EMAIL;
  if (adminEmail) {
    await sendEmail(
      adminEmail,
      "Haftalık Satış Raporu",
      `<div style="font-family:sans-serif;color:#1a1a1a">
        <h2>Son 7 Gün</h2>
        <p>Toplam sipariş: ${total}</p>
        <p>Tamamlanan: ${completed}</p>
        <p>Ciro: ₺${revenue.toFixed(2)}</p>
      </div>`
    );
  }

  return NextResponse.json({ sent: true, total, completed, revenue });
}
