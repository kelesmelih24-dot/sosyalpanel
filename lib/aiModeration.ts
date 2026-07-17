// Uses the Claude API to auto-moderate customer review text. Fully automatic:
// if the API key isn't configured, we fail safe by NOT publishing (so nothing
// inappropriate can slip through just because moderation is unavailable).
export async function moderateReviewText(text: string): Promise<{ safe: boolean; reason?: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { safe: false, reason: "AI moderasyon yapılandırılmamış (ANTHROPIC_API_KEY eksik)." };

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 200,
        system:
          "Bir SMM (sosyal medya hizmetleri) sitesinin müşteri yorumlarını kontrol eden bir moderatörsün. " +
          "Sana verilen yorum metninin YAYINLANMAYA UYGUN olup olmadığına karar ver. " +
          "Uygun değilse (küfür, hakaret, spam, reklam, kişisel bilgi ifşası, alakasız içerik, " +
          "nefret söylemi) safe=false yap. Sadece JSON döndür, başka hiçbir şey yazma: " +
          '{"safe": true veya false, "reason": "kısa gerekçe (varsa)"}',
        messages: [{ role: "user", content: text }],
      }),
    });

    if (!res.ok) return { safe: false, reason: "AI moderasyon isteği başarısız." };
    const data = await res.json();
    const raw = data.content?.[0]?.text ?? "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return { safe: !!parsed.safe, reason: parsed.reason };
  } catch {
    return { safe: false, reason: "AI moderasyon sırasında hata oluştu." };
  }
}
