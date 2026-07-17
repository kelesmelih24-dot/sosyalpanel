import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { moderateReviewText } from "@/lib/aiModeration";
import { grantReviewDiscountIfEligible } from "@/lib/discounts";
import { sendEmail, reviewDiscountEmail } from "@/lib/email";
import { REVIEW_DISCOUNT_PERCENT } from "@/lib/constants";

export async function POST(request: Request) {
  const { author_name, author_email, comment, rating, order_id } = await request.json();

  if (!author_name || !comment || !rating) {
    return NextResponse.json({ error: "Ad, yorum ve puan zorunlu." }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Puan 1 ile 5 arasında olmalı." }, { status: 400 });
  }
  if (comment.length > 1000) {
    return NextResponse.json({ error: "Yorum çok uzun." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Basic abuse guard.
  const oneHourAgo = new Date(Date.now() - 60 * 60_000).toISOString();
  const { count } = await admin
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("author_email", author_email ?? "")
    .gte("created_at", oneHourAgo);
  if ((count ?? 0) >= 3) {
    return NextResponse.json({ error: "Çok fazla değerlendirme gönderdin, lütfen biraz bekle." }, { status: 429 });
  }

  const moderation = await moderateReviewText(comment);

  const { data: review, error } = await admin
    .from("reviews")
    .insert({
      author_name,
      author_email: author_email || null,
      comment,
      rating,
      order_id: order_id || null,
      is_published: moderation.safe,
      ai_moderation_note: moderation.safe ? null : moderation.reason,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Grant the one-time review discount if this email hasn't received one before.
  let discountCode: string | null = null;
  if (author_email) {
    discountCode = await grantReviewDiscountIfEligible(admin, author_email);
    if (discountCode) {
      const { subject, html } = reviewDiscountEmail({ code: discountCode, percent: REVIEW_DISCOUNT_PERCENT });
      await sendEmail(author_email, subject, html);
    }
  }

  return NextResponse.json({ ok: true, published: moderation.safe, discountCode });
}
