import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const statusLabel: Record<string, string> = {
  awaiting_payment: "Ödeme Bekleniyor",
  pending: "Beklemede",
  processing: "İşleniyor",
  in_progress: "Devam Ediyor",
  completed: "Tamamlandı",
  partial: "Kısmi",
  canceled: "İptal",
  refunded: "İade",
};

export async function POST(request: Request) {
  const { orderId, email } = await request.json();
  if (!orderId || !email) {
    return NextResponse.json({ error: "Sipariş numarası ve e-posta gerekli." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, quantity, status, start_count, remains, created_at, guest_email, invoice_url, services(name), profiles(email)")
    .eq("id", orderId)
    .single();

  // Only reveal the order if the provided email matches the order's owner —
  // either a member's account email or the guest checkout email — preventing
  // anyone from scanning order IDs to peek at other people's orders.
  const ownerEmail = (order as any)?.profiles?.email ?? order?.guest_email;
  if (!order || !ownerEmail || ownerEmail.toLowerCase() !== String(email).toLowerCase()) {
    return NextResponse.json({ error: "Sipariş bulunamadı. Sipariş numarasını ve e-postanı kontrol et." }, { status: 404 });
  }

  let invoiceUrl: string | null = null;
  if (order.invoice_url) {
    const { data } = await admin.storage.from("faturalar").createSignedUrl(order.invoice_url, 3600);
    invoiceUrl = data?.signedUrl ?? null;
  }

  return NextResponse.json({
    order: {
      id: order.id,
      service: (order as any).services?.name ?? "—",
      quantity: order.quantity,
      status: order.status,
      statusLabel: statusLabel[order.status] ?? order.status,
      startCount: order.start_count,
      remains: order.remains,
      createdAt: order.created_at,
      invoiceUrl,
    },
  });
}
