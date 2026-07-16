import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { sendEmail, topupApprovedEmail } from "@/lib/email";

// Approve/reject a pending top-up request, or make a direct manual adjustment.
export async function POST(request: Request) {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await request.json();
  const admin = createAdminClient();

  if (body.request_id) {
    const { request_id, action } = body as { request_id: number; action: "approve" | "reject" };
    const { data: req } = await admin
      .from("topup_requests")
      .select("*, profiles(email)")
      .eq("id", request_id)
      .single();
    if (!req || req.status !== "pending") {
      return NextResponse.json({ error: "Talep bulunamadı veya zaten işlendi." }, { status: 400 });
    }

    if (action === "approve") {
      await admin.rpc("admin_adjust_balance", {
        p_user_id: req.user_id,
        p_amount: req.amount,
        p_note: `Bakiye talebi #${req.id} onaylandı`,
      });
      const email = (req as any).profiles?.email;
      if (email) {
        const { subject, html } = topupApprovedEmail(Number(req.amount));
        await sendEmail(email, subject, html);
      }
    }

    await admin
      .from("topup_requests")
      .update({ status: action === "approve" ? "approved" : "rejected", reviewed_at: new Date().toISOString() })
      .eq("id", request_id);

    return NextResponse.json({ ok: true });
  }

  // Direct manual adjustment by admin (e.g. correction, bonus)
  const { user_id, amount, note } = body;
  if (!user_id || !amount) return NextResponse.json({ error: "user_id ve amount gerekli" }, { status: 400 });

  const { error } = await admin.rpc("admin_adjust_balance", {
    p_user_id: user_id,
    p_amount: amount,
    p_note: note ?? "Admin manuel düzenleme",
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
