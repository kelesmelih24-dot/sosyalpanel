import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";

export default function GizlilikPolitikasiPage() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicHeader />
      <div className="mx-auto max-w-2xl px-5 py-16 text-slateMute">
        <h1 className="font-display text-3xl font-bold text-slate">Gizlilik Politikası</h1>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed">
          <section>
            <h2 className="font-display font-semibold text-slate">1. Toplanan Veriler</h2>
            <p className="mt-2">
              Sipariş sırasında e-posta adresi, hedef link, hizmet ve tutar bilgisi; ödeme sürecinde
              yüklediğiniz dekont dosyası toplanır. Üyelik/hesap açma zorunluluğu yoktur, bu yüzden ad
              soyad veya şifre gibi bilgiler talep edilmez.
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">2. Verilerin Kullanım Amacı</h2>
            <p className="mt-2">
              Toplanan veriler; sipariş işleme, ödeme doğrulama, destek talepleri ve yasal
              yükümlülüklerin yerine getirilmesi amacıyla kullanılır.
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">3. Verilerin Paylaşımı</h2>
            <p className="mt-2">
              Sipariş bilgileri, hizmetin teslimi için bağlı olduğu üçüncü taraf tedarikçi API'lerine
              (yalnızca link ve miktar bilgisi) iletilir. Barındırma ve veritabanı altyapısı için Supabase,
              e-posta gönderimi için Resend kullanılmaktadır. Verileriniz pazarlama amacıyla üçüncü
              taraflara satılmaz.
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">4. Veri Saklama Süresi</h2>
            <p className="mt-2">
              Sipariş ve ödemeye ilişkin kayıtlar, Türk Ticaret Kanunu ve Vergi Usul Kanunu gereği
              10 yıl süreyle saklanır. Bu süre dolmadan da{" "}
              <Link href="/veri-silme-talebi" className="text-brand hover:underline">Veri Silme Talebi</Link>{" "}
              sayfamızdan kişisel verilerinizin (e-posta, link, dekont) anonimleştirilmesini talep edebilirsiniz.
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">5. Haklarınız</h2>
            <p className="mt-2">
              6698 sayılı KVKK kapsamındaki haklarınız için{" "}
              <Link href="/kvkk-aydinlatma" className="text-brand hover:underline">KVKK Aydınlatma Metni</Link>{" "}
              sayfamızı inceleyebilirsiniz.
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">6. İletişim</h2>
            <p className="mt-2">MK Software (Melih Keleş), Yenimahalle, Ankara — destek@sosyalpanel.tr</p>
          </section>
        </div>

        <Link href="/" className="mt-10 inline-block text-sm text-brand hover:underline">← Ana sayfaya dön</Link>
      </div>
    </div>
  );
}
