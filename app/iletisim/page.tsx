import { PublicHeader } from "@/components/PublicHeader";

export default function IletisimPage() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicHeader />
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <h1 className="font-display text-3xl font-bold text-slate">İletişim</h1>
        <p className="mt-3 text-slateMute">
          Herhangi bir sorun veya sorunuz için aşağıdaki kanallardan bize ulaşabilirsiniz.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <a
            href="mailto:destek@sosyalpanel.com"
            className="rounded-2xl border border-border2 bg-blush p-6 text-left transition-colors hover:border-brand"
          >
            <div className="font-display font-semibold text-slate">✉️ E-posta</div>
            <div className="mt-1 text-sm text-slateMute">destek@sosyalpanel.com</div>
          </a>
          <a
            href="https://wa.me/905000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-border2 bg-blush p-6 text-left transition-colors hover:border-brand"
          >
            <div className="font-display font-semibold text-slate">💬 Whatsapp</div>
            <div className="mt-1 text-sm text-slateMute">Hızlı destek için yazın</div>
          </a>
        </div>

        <p className="mt-8 text-xs text-slateMute">
          [Buraya gerçek şirket adresi, telefon numarası ve çalışma saatlerini ekle.]
        </p>
      </div>
    </div>
  );
}
