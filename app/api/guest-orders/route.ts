import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendTelegramMessage } from "@/lib/telegram";
import { sendEmail, guestOrderReceivedEmail } from "@/lib/email";

export async function POST(request: Request) {
  const formData = await request.formData();

  const service_id = formData.get("service_id") as string;
  const link = formData.get("link") as string;
  const quantity = Number(formData.get("quantity"));
  const guest_email = formData.get("guest_email") as string;
  const payment_method = (formData.get("payment_method") as string) || "havale";
  const dekont = formData.get("dekont") as File | null;

  if (!service_id || !link || !quantity || !guest_email) {
    return NextResponse.json({ error: "Eksik alan var." }, { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(guest_email)) {
    return NextResponse.json({ error: "Geçerli bir e-posta gir." }, { status: 400 });
  }
  if (!dekont || dekont.size === 0) {
    return NextResponse.json({ error: "Ödeme dekontunu yüklemen gerekiyor." }, { status: 400 });
  }
  if (dekont.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Dekont dosyası çok büyük (maks 8MB)." }, { status: 400 });
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
    .select("id, name, min_quantity, max_quantity, price_per_1000, is_active")
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

  // Upload the receipt to private Storage before creating the order row.
  const ext = dekont.name.split(".").pop() || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error: uploadError } = await admin.storage
    .from("dekontlar")
    .upload(path, dekont, { contentType: dekont.type || "application/octet-stream" });

  if (uploadError) {
    return NextResponse.json({ error: "Dekont yüklenemedi: " + uploadError.message }, { status: 400 });
  }

  const { data: order, error } = await admin
    .from("orders")
    .insert({
      service_id,
      link,
      quantity,
      charge,
      guest_email,
      payment_method,
      dekont_url: path,
      status: "awaiting_payment",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Notify the site owner on Telegram right away — this is the main trigger
  // for them to go review the receipt and approve the order.
  await sendTelegramMessage(
    `🧾 <b>Yeni dekont yüklendi</b>\n` +
      `Sipariş: #${order.id}\n` +
      `Hizmet: ${service.name}\n` +
      `Miktar: ${quantity.toLocaleString("tr-TR")}\n` +
      `Tutar: ₺${charge.toFixed(2)}\n` +
      `E-posta: ${guest_email}\n` +
      `Link: ${link}\n\n` +
      `Onaylamak için admin panelindeki Siparişler sayfasına git.`
  );

  const { subject, html } = guestOrderReceivedEmail({ orderId: order.id, serviceName: service.name, amount: charge });
  await sendEmail(guest_email, subject, html);

  return NextResponse.json({ order });
}
