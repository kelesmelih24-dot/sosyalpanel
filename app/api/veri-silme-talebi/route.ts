import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(request: Request) {
  const { orderId, email } = await request.json();
  if (!orderId || !email) {
    return NextResponse.json({ error: "Sipariş numarası ve e-posta gerekli." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: order } = await admin.from("orders").select("id, guest_email").eq("id", orderId).single();

  if (!order || order.guest_email?.toLowerCase() !== String(email).toLowerCase()) {
    return NextResponse.json({ error: "Sipariş bulunamadı. Bilgilerini kontrol et." }, { status: 404 });
  }

  // Permanently remove personal data: replace identifying fields, delete
  // storage files, delete related reviews/discount codes tied to this email.
  await admin
    .from("orders")
    .update({
      guest_email: null,
      link: "[silindi]",
      dekont_url: null,
      invoice_url: null,
      upload_token: null,
    })
    .eq("id", orderId);

  await admin.from("reviews").delete().eq("author_email", email);
  await admin.from("discount_codes").delete().eq("owner_email", email);

  await sendTelegramMessage(`🗑️ KVKK veri silme talebi işlendi: Sipariş #${orderId}, e-posta: ${email}`);

  return NextResponse.json({ ok: true });
}
