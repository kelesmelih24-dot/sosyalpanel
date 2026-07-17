import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";

export default function GizlilikPolitikasiPage() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicHeader />
      <div className="mx-auto max-w-2xl px-5 py-16 text-slateMute">
        <h1 className="font-display text-3xl font-bold text-slate">Gizlilik Politikası</h1>

        <div className="mt-4 rounded-lg border border-amber/40 bg-amber/10 p-4 text-sm text-amber">
          <strong>Önemli:</strong> Bu sayfa genel bir taslaktır, hukuki tavsiye değildir. Hangi verileri,
          hangi amaçla, ne kadar süre sakladığını ve hangi üçüncü taraflarla (Supabase, tedarikçiler,
          ödeme sağlayıcıları) paylaştığını netleştirip bir avukata onaylatmalısın.
        </div>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed">
          <section>
            <h2 className="font-display font-semibold text-slate">1. Toplanan Veriler</h2>
            <p className="mt-2">
              Üyelik sırasında ad soyad ve e-posta adresi; sipariş sırasında hedef link, hizmet ve tutar
              bilgisi; bakiye yükleme sırasında ödeme yöntemi ve dekont notu toplanır.
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">2. Verilerin Kullanım Amacı</h2>
            <p className="mt-2">
              Toplanan veriler; hesap oluşturma, sipariş işleme, bakiye yönetimi, destek talepleri ve
              yasal yükümlülüklerin yerine getirilmesi amacıyla kullanılır.
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">3. Verilerin Paylaşımı</h2>
            <p className="mt-2">
              Sipariş bilgileri, hizmetin teslimi için bağlı olduğu üçüncü taraf tedarikçi API'lerine
              (yalnızca link ve miktar bilgisi) iletilir. Barındırma ve veritabanı altyapısı için Supabase
              kullanılmaktadır. Verileriniz pazarlama amacıyla üçüncü taraflara satılmaz.
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">4. Veri Saklama Süresi</h2>
            <p className="mt-2">[Yasal saklama sürelerini mali müşavirinle netleştirip buraya yaz.]</p>
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
            <p className="mt-2">[Veri sorumlusu iletişim bilgilerini buraya ekle.]</p>
          </section>
        </div>

        <Link href="/" className="mt-10 inline-block text-sm text-brand hover:underline">← Ana sayfaya dön</Link>
      </div>
    </div>
  );
}
