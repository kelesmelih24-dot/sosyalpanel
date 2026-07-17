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
        <p>Detaylar için "Sipariş Sorgula" sayfasından sipariş numaranı ve e-postanı girerek bakabilirsin.</p>
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

export function guestOrderPaymentInfoEmail(params: {
  orderId: number;
  serviceName: string;
  amount: number;
  uploadUrl: string;
  bankAccountName: string;
  iban: string;
  bankName: string;
  transferNote: string;
}) {
  return {
    subject: `Sipariş #${params.orderId} — Ödeme bilgileri ve dekont yükleme linki`,
    html: `
      <div style="font-family:sans-serif;color:#1a1a1a">
        <h2>Siparişin oluşturuldu</h2>
        <p><strong>Sipariş:</strong> #${params.orderId} — ${params.serviceName}</p>
        <p><strong>Tutar:</strong> ₺${params.amount.toFixed(2)}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
        <p><strong>Ödeme bilgileri</strong></p>
        <p>Alıcı: ${params.bankAccountName}<br/>
        IBAN: ${params.iban}<br/>
        Banka: ${params.bankName}</p>
        <p style="background:#fef2f2;color:#b91c1c;padding:10px 14px;border-radius:8px">
          ⚠️ <strong>Zorunlu:</strong> Transfer açıklama kısmına mutlaka
          "<strong>${params.transferNote}</strong>" (hesap kullanıcı adın) yazın.
          Açıklama boş bırakılırsa veya farklı yazılırsa ödemeniz eşleştirilemez.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
        <p>Ödemeni yaptıktan sonra aşağıdaki bağlantıdan dekontunu (fotoğraf/PDF) yükle —
        yükleme tamamlanınca siparişin onay için ekibimize iletilir:</p>
        <p><a href="${params.uploadUrl}" style="display:inline-block;background:#E6106B;color:#fff;
        padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">Dekontu Yükle</a></p>
        <p style="color:#666;font-size:13px">Bağlantı çalışmazsa: ${params.uploadUrl}</p>
      </div>
    `,
  };
}

export function guestDekontReceivedEmail(params: { orderId: number; serviceName: string }) {
  return {
    subject: `Dekontun alındı — Sipariş #${params.orderId}`,
    html: `
      <div style="font-family:sans-serif;color:#1a1a1a">
        <h2>Dekontun bize ulaştı</h2>
        <p><strong>Sipariş:</strong> #${params.orderId} — ${params.serviceName}</p>
        <p>Ekibimiz dekontunu kontrol edip onayladığında siparişin otomatik olarak işleme girecek.
        Durumunu dilediğin zaman "Sipariş Sorgula" sayfasından sipariş numaranı ve e-postanı
        girerek takip edebilirsin.</p>
      </div>
    `,
  };
}
