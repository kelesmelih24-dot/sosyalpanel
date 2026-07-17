import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { BANK_INFO, MIN_ORDER_AMOUNT } from "@/lib/constants";

export default function OnBilgilendirmePage() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicHeader />
      <div className="mx-auto max-w-2xl px-5 py-16 text-slateMute">
        <h1 className="font-display text-3xl font-bold text-slate">Ön Bilgilendirme Formu</h1>

        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Önemli:</strong> Bu sayfa genel bir taslaktır, hukuki tavsiye değildir. Yayına almadan
          önce bir avukata onaylatıp kendi bilgilerinle güncelle.
        </div>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed">
          <section>
            <h2 className="font-display font-semibold text-slate">Satıcı Bilgileri</h2>
            <p className="mt-2">
              Unvan: [Şahıs Şirketi Unvanı]<br />
              Adres: [Adres]<br />
              E-posta: destek@sosyalpanel.com
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">Hizmetin Temel Özellikleri</h2>
            <p className="mt-2">
              Satılan hizmetler sosyal medya platformları için etkileşim hizmetleridir (takipçi, beğeni,
              izlenme vb.). Her hizmetin adı, açıklaması, miktar aralığı ve fiyatı ilgili hizmet sayfasında
              gösterilir.
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">Toplam Fiyat ve Vergiler</h2>
            <p className="mt-2">
              Gösterilen fiyatlara KDV dahildir. Ek bir vergi veya ücret uygulanmaz. Minimum sipariş
              tutarı ₺{MIN_ORDER_AMOUNT}'dir.
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">Ödeme Şekli</h2>
            <p className="mt-2">
              Ödeme, {BANK_INFO.bankName} üzerinden banka havalesi/EFT ile alınır. Ödeme dekontu
              onaylanmadan hizmet işleme alınmaz.
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">Cayma Hakkı</h2>
            <p className="mt-2">
              Hizmetin ifasına Alıcı'nın onayı ile hemen başlanması ve elektronik ortamda anında ifa
              edilmesi nedeniyle, ilgili mevzuat uyarınca cayma hakkı bulunmamaktadır.
              [Bu maddeyi bir avukatla teyit et.]
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">Şikayet ve İtirazlar</h2>
            <p className="mt-2">
              Şikayetlerinizi İletişim sayfamızdan veya Tüketici Hakem Heyetleri'ne başvurarak iletebilirsiniz.
            </p>
          </section>
        </div>

        <Link href="/" className="mt-10 inline-block text-sm text-brand hover:underline">← Ana sayfaya dön</Link>
      </div>
    </div>
  );
}
