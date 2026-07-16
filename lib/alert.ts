// Posts a plain-text alert to a generic incoming webhook if ALERT_WEBHOOK_URL is
// configured. Works as-is with Slack and Discord incoming webhooks (both accept
// { "text": "..." } / { "content": "..." } — we send both keys for compatibility).
export async function sendAlert(message: string) {
  const url = process.env.ALERT_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message, content: message }),
    });
  } catch {
    // best-effort only — never let an alert failure break the calling flow
  }
}
