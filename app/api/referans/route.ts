import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getOrCreateReferralCode } from "@/lib/referrals";

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Geçerli bir e-posta gir." }, { status: 400 });
  }

  const admin = createAdminClient();
  const refCode = await getOrCreateReferralCode(admin, email);
  if (!refCode) return NextResponse.json({ error: "Bir sorun oluştu." }, { status: 400 });

  const link = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/?ref=${refCode.code}`;
  return NextResponse.json({ link, code: refCode.code });
}
