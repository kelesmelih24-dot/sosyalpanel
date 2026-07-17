// Sends a plain-text message to your Telegram chat via the Bot API.
// Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID env vars — if either is
// missing, this silently no-ops so the rest of the order flow keeps working.
export async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch {
    // best-effort only — a failed notification should never break an order
  }
}
