import { REFERRAL_DISCOUNT_PERCENT, REFERRAL_MAX_USES_PER_CODE } from "@/lib/constants";

function randomCode(prefix: string) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}${s}`;
}

// Returns the referrer's existing code, or creates a new one.
export async function getOrCreateReferralCode(admin: any, email: string) {
  const { data: existing } = await admin
    .from("referral_codes")
    .select("*")
    .eq("referrer_email", email)
    .limit(1);

  if (existing && existing.length > 0) return existing[0];

  const code = randomCode("REF");
  const { data: created } = await admin
    .from("referral_codes")
    .insert({ referrer_email: email, code, max_uses: REFERRAL_MAX_USES_PER_CODE })
    .select()
    .single();
  return created;
}

// Called when a NEW customer places an order using someone's referral link.
// Applies the discount and logs the redemption (reward to the referrer is
// only granted later, once this order is actually completed).
export async function redeemReferralCode(admin: any, code: string, referredEmail: string, orderId: number) {
  const { data: refCode } = await admin
    .from("referral_codes")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .single();

  if (!refCode) return { applied: false as const };
  if (refCode.uses >= refCode.max_uses) return { applied: false as const };
  if (refCode.referrer_email.toLowerCase() === referredEmail.toLowerCase()) return { applied: false as const }; // no self-referral

  await admin.from("referral_redemptions").insert({
    referral_code_id: refCode.id,
    referred_email: referredEmail,
    referred_order_id: orderId,
  });
  await admin.from("referral_codes").update({ uses: refCode.uses + 1 }).eq("id", refCode.id);

  return { applied: true as const, percent: REFERRAL_DISCOUNT_PERCENT };
}

// Called whenever an order's status changes to 'completed' — grants the
// referrer their reward code the first (and only) time for that redemption.
export async function grantReferralRewardIfCompleted(admin: any, orderId: number) {
  const { data: list } = await admin
    .from("referral_redemptions")
    .select("*, referral_codes(referrer_email)")
    .eq("referred_order_id", orderId)
    .eq("reward_granted", false)
    .limit(1);

  const row = (list ?? [])[0];
  if (!row) return null;

  const referrerEmail = row.referral_codes?.referrer_email;
  if (!referrerEmail) return null;

  const code = randomCode("REFOD");
  const expires = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  await admin.from("discount_codes").insert({
    code,
    type: "referral",
    percent: REFERRAL_DISCOUNT_PERCENT,
    owner_email: referrerEmail,
    max_uses: 1,
    expires_at: expires.toISOString(),
  });
  await admin.from("referral_redemptions").update({ reward_granted: true }).eq("id", row.id);

  return { referrerEmail, code };
}
