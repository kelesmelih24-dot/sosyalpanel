import { PublicHeader } from "@/components/PublicHeader";

export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicHeader />
      <div className="mx-auto max-w-2xl px-5 py-16">
        <h1 className="font-display text-3xl font-bold text-slate">Hakkımızda</h1>
        <p className="mt-4 text-slateMute leading-relaxed">
          SosyalPanel, Instagram, TikTok, YouTube, X (Twitter), Telegram ve daha birçok platform için
          uygun fiyatlı ve hızlı sosyal medya etkileşim hizmetleri sunan bir SMM panelidir. Amacımız,
          bireysel kullanıcılardan ajanslara kadar herkesin sosyal medya varlığını güvenli ve şeffaf bir
          şekilde büyütmesine yardımcı olmak.
        </p>
        <p className="mt-4 text-slateMute leading-relaxed">
          [Buraya kuruluş yılı, ekip bilgisi, misyon/vizyon gibi gerçek kurumsal bilgilerini ekle.]
        </p>
      </div>
    </div>
  );
}
