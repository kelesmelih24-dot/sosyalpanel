// Uses the Groq API (free tier, no credit card, no commercial-use restriction
// unlike some other free AI tiers) to auto-moderate customer review text.
// Fails safe: if the API key isn't configured, we do NOT publish, so nothing
// inappropriate can slip through just because moderation is unavailable.
export async function moderateReviewText(text: string): Promise<{ safe: boolean; reason?: string }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { safe: false, reason: "AI moderasyon yapılandırılmamış (GROQ_API_KEY eksik)." };

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 200,
        messages: [
          {
            role: "system",
            content:
              "Bir SMM (sosyal medya hizmetleri) sitesinin müşteri yorumlarını kontrol eden bir moderatörsün. " +
              "Sana verilen yorum metninin YAYINLANMAYA UYGUN olup olmadığına karar ver. " +
              "Uygun değilse (küfür, hakaret, spam, reklam, kişisel bilgi ifşası, alakasız içerik, " +
              "nefret söylemi) safe=false yap. Sadece JSON döndür, başka hiçbir şey yazma: " +
              '{"safe": true veya false, "reason": "kısa gerekçe (varsa)"}',
          },
          { role: "user", content: text },
        ],
      }),
    });

    if (!res.ok) return { safe: false, reason: "AI moderasyon isteği başarısız." };
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return { safe: !!parsed.safe, reason: parsed.reason };
  } catch {
    return { safe: false, reason: "AI moderasyon sırasında hata oluştu." };
  }
}
