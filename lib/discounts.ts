import { WELCOME_DISCOUNT_PERCENT, REVIEW_DISCOUNT_PERCENT, REVIEW_DISCOUNT_VALID_DAYS } from "@/lib/constants";

function randomCode(prefix: string) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}${s}`;
}

// Validates a coupon code the customer typed in at checkout. Returns the
// percent discount to apply, or an error if invalid/expired/exhausted.
export async function validateDiscountCode(admin: any, code: string) {
  if (!code) return { valid: false as const, error: "Kod boş." };

  const { data: row } = await admin
    .from("discount_codes")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .single();

  if (!row) return { valid: false as const, error: "Geçersiz kupon kodu." };
  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return { valid: false as const, error: "Bu kuponun süresi dolmuş." };
  }
  if (row.used_count >= row.max_uses) {
    return { valid: false as const, error: "Bu kupon zaten kullanılmış." };
  }

  return { valid: true as const, percent: Number(row.percent), id: row.id };
}

export async function markDiscountCodeUsed(admin: any, codeId: number) {
  const { data } = await admin.from("discount_codes").select("used_count").eq("id", codeId).single();
  if (data) {
    await admin.from("discount_codes").update({ used_count: data.used_count + 1 }).eq("id", codeId);
  }
}

// A customer is eligible for the welcome discount if they've never had an
// order (member or guest) under this email before.
export async function isFirstOrder(admin: any, email: string) {
  const { count } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("guest_email", email);
  return (count ?? 0) === 0;
}

export function welcomeDiscountPercent() {
  return WELCOME_DISCOUNT_PERCENT;
}

// Generates a one-time review-reward code for this email, but only if they
// haven't already received one (first review only, per the site's rules).
export async function grantReviewDiscountIfEligible(admin: any, email: string) {
  const { data: existingList } = await admin
    .from("discount_codes")
    .select("id")
    .eq("owner_email", email)
    .eq("type", "review")
    .limit(1);

  if ((existingList ?? []).length > 0) return null;

  const code = randomCode("YORUM");
  const expires = new Date(Date.now() + REVIEW_DISCOUNT_VALID_DAYS * 24 * 60 * 60 * 1000);
  await admin.from("discount_codes").insert({
    code,
    type: "review",
    percent: REVIEW_DISCOUNT_PERCENT,
    owner_email: email,
    max_uses: 1,
    expires_at: expires.toISOString(),
  });
  return code;
}
