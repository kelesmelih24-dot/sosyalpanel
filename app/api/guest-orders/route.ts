import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail, guestOrderPaymentInfoEmail } from "@/lib/email";
import { extractHandle } from "@/lib/extractHandle";
import { BANK_INFO, MIN_ORDER_AMOUNT, BULK_DISCOUNT_THRESHOLD, BULK_DISCOUNT_PERCENT, WELCOME_DISCOUNT_PERCENT } from "@/lib/constants";
import { validateDiscountCode, markDiscountCodeUsed, isFirstOrder } from "@/lib/discounts";

// Step 1: create the order (no receipt yet) and email the customer the bank
// details + a private link where they can upload their receipt once they've paid.
export async function POST(request: Request) {
  const { service_id, link, quantity, guest_email, payment_method, coupon_code } = await request.json();

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

  const baseCharge = Math.round((quantity / 1000) * Number(service.price_per_1000) * 100) / 100;

  if (baseCharge < MIN_ORDER_AMOUNT) {
    return NextResponse.json(
      { error: `Minimum sipariş tutarı ₺${MIN_ORDER_AMOUNT}. Miktarı artırman gerekiyor.` },
      { status: 400 }
    );
  }

  // Automatic bulk-quantity discount (independent of coupon codes).
  const bulkDiscountAmount =
    quantity >= BULK_DISCOUNT_THRESHOLD ? Math.round(baseCharge * (BULK_DISCOUNT_PERCENT / 100) * 100) / 100 : 0;

  // Priority: explicit coupon code > automatic first-order welcome discount.
  let couponDiscountAmount = 0;
  let appliedCode: string | null = null;
  let codeIdToMark: number | null = null;

  if (coupon_code) {
    const result = await validateDiscountCode(admin, coupon_code);
    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    couponDiscountAmount = Math.round(baseCharge * (result.percent / 100) * 100) / 100;
    appliedCode = coupon_code.trim().toUpperCase();
    codeIdToMark = result.id;
  } else {
    const firstOrder = await isFirstOrder(admin, guest_email);
    if (firstOrder) {
      couponDiscountAmount = Math.round(baseCharge * (WELCOME_DISCOUNT_PERCENT / 100) * 100) / 100;
      appliedCode = "HOŞGELDİN";
    }
  }

  const charge = Math.max(0, Math.round((baseCharge - bulkDiscountAmount - couponDiscountAmount) * 100) / 100);
  const uploadToken = randomBytes(20).toString("hex");

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
      upload_token: uploadToken,
      discount_code: appliedCode,
      discount_amount: couponDiscountAmount,
      bulk_discount_amount: bulkDiscountAmount,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (codeIdToMark) await markDiscountCodeUsed(admin, codeIdToMark);

  const uploadUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/misafir-siparis/dekont?order=${order.id}&token=${uploadToken}`;

  const { subject, html } = guestOrderPaymentInfoEmail({
    orderId: order.id,
    serviceName: service.name,
    amount: charge,
    uploadUrl,
    bankAccountName: BANK_INFO.accountName,
    iban: BANK_INFO.iban,
    bankName: BANK_INFO.bankName,
    transferNote: extractHandle(link),
  });
  await sendEmail(guest_email, subject, html);

  // Return the upload path (relative) too, so the confirmation screen can show
  // a direct link even if the email doesn't arrive or RESEND isn't configured.
  return NextResponse.json({
    order,
    uploadPath: `/misafir-siparis/dekont?order=${order.id}&token=${uploadToken}`,
  });
}
