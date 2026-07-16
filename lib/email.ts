// Sends transactional emails via Resend (https://resend.com). Entirely optional:
// if RESEND_API_KEY isn't set, every call here is a silent no-op so the rest of
// the app keeps working without an email provider configured.
export async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "SosyalPanel <bildirim@example.com>",
        to,
        subject,
        html,
      }),
    });
  } catch {
    // best-effort only — a failed notification email should never break an order flow
  }
}

export function orderStatusEmail(params: { orderId: number; serviceName: string; status: string }) {
  const statusLabel: Record<string, string> = {
    completed: "Tamamlandı ✅",
    partial: "Kısmi Teslim Edildi",
    canceled: "İptal Edildi",
    refunded: "İade Edildi",
  };
  const label = statusLabel[params.status] ?? params.status;
  return {
    subject: `Sipariş #${params.orderId} — ${label}`,
    html: `
      <div style="font-family:sans-serif;color:#1a1a1a">
        <h2>Sipariş durumun güncellendi</h2>
        <p><strong>Sipariş:</strong> #${params.orderId} — ${params.serviceName}</p>
        <p><strong>Yeni durum:</strong> ${label}</p>
        <p>Detaylar için panelindeki "Siparişlerim" sayfasına göz atabilirsin.</p>
      </div>
    `,
  };
}

export function topupApprovedEmail(amount: number) {
  return {
    subject: `Bakiye yükleme talebin onaylandı`,
    html: `
      <div style="font-family:sans-serif;color:#1a1a1a">
        <h2>Bakiyen yüklendi</h2>
        <p>₺${amount.toFixed(2)} tutarındaki bakiye yükleme talebin onaylandı ve hesabına yansıtıldı.</p>
      </div>
    `,
  };
}
