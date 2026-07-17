import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendTelegramMessage } from "@/lib/telegram";
import { sendEmail, guestDekontReceivedEmail } from "@/lib/email";

// Fetch order summary for the upload page — guest visitors have no session,
// so RLS would block a direct client read; this goes through the admin client
// and only reveals the order if the token matches.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("order");
  const token = searchParams.get("token");

  if (!orderId || !token) {
    return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, status, charge, quantity, link, services(name)")
    .eq("id", orderId)
    .eq("upload_token", token)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({ order });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const orderId = formData.get("order_id") as string;
  const token = formData.get("token") as string;
  const dekont = formData.get("dekont") as File | null;

  if (!orderId || !token) {
    return NextResponse.json({ error: "Geçersiz bağlantı." }, { status: 400 });
  }
  if (!dekont || dekont.size === 0) {
    return NextResponse.json({ error: "Ödeme dekontunu yüklemen gerekiyor." }, { status: 400 });
  }
  if (dekont.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Dekont dosyası çok büyük (maks 8MB)." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, status, upload_token, guest_email, quantity, charge, link, services(name)")
    .eq("id", orderId)
    .single();

  if (!order || order.upload_token !== token) {
    return NextResponse.json({ error: "Geçersiz veya süresi dolmuş bağlantı." }, { status: 404 });
  }
  if (order.status !== "awaiting_payment") {
    return NextResponse.json({ error: "Bu sipariş için dekont zaten yüklenmiş veya işleme alınmış." }, { status: 400 });
  }

  const ext = dekont.name.split(".").pop() || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error: uploadError } = await admin.storage
    .from("dekontlar")
    .upload(path, dekont, { contentType: dekont.type || "application/octet-stream" });

  if (uploadError) {
    return NextResponse.json({ error: "Dekont yüklenemedi: " + uploadError.message }, { status: 400 });
  }

  await admin.from("orders").update({ dekont_url: path }).eq("id", orderId);

  const serviceName = (order as any).services?.name ?? "Hizmet";

  await sendTelegramMessage(
    `🧾 <b>Yeni dekont yüklendi</b>\n` +
      `Sipariş: #${order.id}\n` +
      `Hizmet: ${serviceName}\n` +
      `Miktar: ${order.quantity.toLocaleString("tr-TR")}\n` +
      `Tutar: ₺${Number(order.charge).toFixed(2)}\n` +
      `E-posta: ${order.guest_email}\n` +
      `Link: ${order.link}\n\n` +
      `Onaylamak için admin panelindeki Siparişler sayfasına git.`
  );

  if (order.guest_email) {
    const { subject, html } = guestDekontReceivedEmail({ orderId: order.id, serviceName });
    await sendEmail(order.guest_email, subject, html);
  }

  return NextResponse.json({ ok: true });
}
