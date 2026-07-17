import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";
import { MIN_ORDER_AMOUNT, BULK_DISCOUNT_THRESHOLD, BULK_DISCOUNT_PERCENT, WELCOME_DISCOUNT_PERCENT } from "@/lib/constants";

// Site knowledge the assistant should answer from. Edit this as your real
// policies evolve — see README for how to add more example Q&A scenarios.
const SYSTEM_PROMPT = `Sen SosyalPanel adlı bir SMM (sosyal medya pazarlama) panelinin canlı destek asistanısın.
Enerjik, samimi, emoji kullanan bir tonun var ama gereksiz uzatmıyorsun.

BİLMEN GEREKEN POLİTİKALAR:
- Üye olmaya gerek yok: müşteri hizmeti seçer, link+miktar+e-posta girer, banka bilgileri e-postasına gider, dekont yükler, onaylanınca sipariş işleme girer.
- Minimum sipariş tutarı: ₺${MIN_ORDER_AMOUNT}
- ${BULK_DISCOUNT_THRESHOLD.toLocaleString("tr-TR")}+ adet siparişte otomatik %${BULK_DISCOUNT_PERCENT} indirim uygulanır.
- İlk siparişte otomatik %${WELCOME_DISCOUNT_PERCENT} hoşgeldin indirimi uygulanır (kupon kodu gerekmez).
- İADE POLİTİKASI: Tüm satışlar kesindir, iade yapılmaz.
- Ödeme sadece Havale/EFT ile alınır (kripto ve kredi kartı "çok yakında").
- Dekont, sipariş oluşturulduğunda e-postaya gelen özel link üzerinden yüklenir.
- 24 saat içinde dekont yüklenmezse sipariş otomatik iptal olur.
- Sipariş durumu "Sipariş Sorgula" sayfasından (sipariş no + e-posta ile) takip edilebilir.
- Fiyatlara KDV dahildir.
- Destek mesai saatleri: 09:00-18:00 (hafta içi).
- Değerlendirme bırakan müşteriler %5 indirim kodu kazanır (ilk değerlendirmede, tek seferlik).

KURALLAR:
- Sorulara bu bilgilerle net ve kısa cevap ver.
- Sipariş/ödeme durumu gibi SENİN BİLEMEYECEĞİN, hesaba özel veya karmaşık/sinirli bir durum varsa
  (örn. "param gitti ama siparişim gelmedi", "dekontum kabul edilmedi", şikayet, öfke, dolandırıcılık iddiası)
  cevabının EN SONUNA yeni bir satırda tam olarak şunu ekle: [ESCALATE]
  Bu durumda müşteriye de "Bunu ekibimize ilettim, kısa sürede sana dönecekler" gibi bir şey söyle.
- [ESCALATE] etiketini sadece gerçekten gerektiğinde kullan, her soruda kullanma.`;

export async function POST(request: Request) {
  const { messages } = await request.json();
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      reply: "Şu an canlı destek asistanı yapılandırılmamış. Bize Whatsapp veya e-postadan ulaşabilirsin. 🙏",
      escalated: false,
    });
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 500,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...(messages ?? []).map((m: any) => ({ role: m.role, content: m.content }))],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ reply: "Şu an cevap veremiyorum, lütfen Whatsapp'tan yaz. 🙏", escalated: false });
    }

    const data = await res.json();
    let reply: string = data.choices?.[0]?.message?.content ?? "Üzgünüm, şu an cevap veremiyorum.";

    const escalated = reply.includes("[ESCALATE]");
    reply = reply.replace("[ESCALATE]", "").trim();

    if (escalated) {
      const lastUserMessage = [...(messages ?? [])].reverse().find((m: any) => m.role === "user")?.content ?? "";
      await sendTelegramMessage(
        `🆘 <b>AI destek eskalasyonu</b>\nMüşteri sorusu: ${lastUserMessage}\n\nCanlı destek panelden veya müşteriye ulaşarak devam et.`
      );
    }

    return NextResponse.json({ reply, escalated });
  } catch {
    return NextResponse.json({ reply: "Şu an cevap veremiyorum, lütfen Whatsapp'tan yaz. 🙏", escalated: false });
  }
}
