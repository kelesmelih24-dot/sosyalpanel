import { NextResponse } from "next/server";
import { requireFullAdmin } from "@/lib/supabase/require-admin";

export async function POST(request: Request) {
  const check = await requireFullAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const { topic } = await request.json();
  if (!topic) return NextResponse.json({ error: "Konu gerekli." }, { status: 400 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY ayarlanmamış." }, { status: 400 });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system:
        "Bir SMM (sosyal medya pazarlama) panelinin blogu için SEO odaklı, Türkçe, bilgilendirici " +
        "bir yazı yazıyorsun. Ton enerjik ama profesyonel. Yanıtını SADECE şu JSON formatında ver, " +
        'başka hiçbir şey yazma: {"title": "...", "excerpt": "1-2 cümlelik özet", "content": "HTML formatında, ' +
        '<h2>, <p>, <ul><li> etiketleriyle biçimlendirilmiş 400-600 kelimelik yazı"}',
      messages: [{ role: "user", content: `Konu: ${topic}` }],
    }),
  });

  if (!res.ok) return NextResponse.json({ error: "AI isteği başarısız oldu." }, { status: 400 });

  const data = await res.json();
  const raw = data.content?.[0]?.text ?? "";
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "AI cevabı ayrıştırılamadı, tekrar dene." }, { status: 400 });
  }
}
