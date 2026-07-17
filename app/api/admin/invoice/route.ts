import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const formData = await request.formData();
  const orderId = formData.get("order_id") as string;
  const file = formData.get("invoice") as File | null;

  if (!orderId || !file) return NextResponse.json({ error: "Eksik alan var." }, { status: 400 });

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, guest_email, services(name), profiles(email)")
    .eq("id", orderId)
    .single();
  if (!order) return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });

  const ext = file.name.split(".").pop() || "pdf";
  const path = `${orderId}-${Date.now()}.${ext}`;
  const { error: uploadError } = await admin.storage
    .from("faturalar")
    .upload(path, file, { contentType: file.type || "application/pdf" });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 });

  await admin.from("orders").update({ invoice_url: path }).eq("id", orderId);

  const customerEmail = (order as any).profiles?.email ?? order.guest_email;
  const serviceName = (order as any).services?.name ?? "Hizmet";
  if (customerEmail) {
    await sendEmail(
      customerEmail,
      `Sipariş #${orderId} faturan hazır`,
      `<div style="font-family:sans-serif;color:#1a1a1a">
        <h2>Faturan yüklendi</h2>
        <p><strong>Sipariş:</strong> #${orderId} — ${serviceName}</p>
        <p>Faturanı "Sipariş Sorgula" sayfasından sipariş numaranı ve e-postanı girerek görebilirsin.</p>
      </div>`
    );
  }

  return NextResponse.json({ ok: true });
}
