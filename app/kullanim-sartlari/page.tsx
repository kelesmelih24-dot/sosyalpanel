import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";

export default function KullanimSartlariPage() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicHeader />
      <div className="mx-auto max-w-2xl px-5 py-16 text-slateMute">
        <h1 className="font-display text-3xl font-bold text-slate">Kullanım Şartları</h1>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed">
          <section>
            <h2 className="font-display font-semibold text-slate">1. Taraflar</h2>
            <p className="mt-2">
              Bu kullanım şartları, MK Software (Melih Keleş) ("Panel") ile platformu kullanan
              müşteri ("Kullanıcı") arasındaki ilişkiyi düzenler. Siteyi kullanarak bu şartları kabul
              etmiş sayılırsınız.
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">2. Hizmetin Niteliği</h2>
            <p className="mt-2">
              Panel, sosyal medya platformlarına yönelik takipçi, beğeni, izlenme ve benzeri etkileşim
              hizmetlerinin toptan/perakende satışını yapar. Bu hizmetler üçüncü taraf tedarikçiler
              aracılığıyla sağlanır ve teslimat süresi, kalitesi tedarikçiye bağlı olarak değişebilir.
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">3. Kullanıcı Sorumlulukları</h2>
            <p className="mt-2">
              Kullanıcı, sipariş verdiği hesap/linkin kendisine ait olduğunu veya işlem yapma yetkisine
              sahip olduğunu beyan eder. Sipariş edilen platformun kullanım koşullarına aykırı kullanım
              nedeniyle doğabilecek hesap kısıtlaması, askıya alma vb. sonuçlardan Panel sorumlu tutulamaz.
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">4. Sipariş ve Ödeme</h2>
            <p className="mt-2">
              Sipariş, ödeme dekontunun yüklenip Panel tarafından onaylanmasının ardından işleme alınır.
              Ödeme banka havalesi/EFT ile yapılır. Dekont, sipariş oluşturulduktan sonra 24 saat içinde
              yüklenmezse sipariş otomatik olarak iptal edilir.
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">5. Sipariş İptali ve İade</h2>
            <p className="mt-2">
              Ödemesi onaylanıp işleme alınmış siparişlerde iade yapılmaz; tüm satışlar kesindir.
              Ödemesi henüz onaylanmamış ("ödeme bekleniyor" durumundaki) siparişler için destek
              ekibinden iptal talep edilebilir.
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">6. Sorumluluk Sınırı</h2>
            <p className="mt-2">
              Panel, üçüncü taraf tedarikçilerin hizmet kalitesinden, teslimat süresinden veya sosyal medya
              platformlarının politika değişikliklerinden doğabilecek kayıplardan sorumlu tutulamaz.
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">7. Uyuşmazlıkların Çözümü</h2>
            <p className="mt-2">
              İşbu sözleşmeden doğan uyuşmazlıklarda Ankara Tüketici Hakem Heyetleri ve Mahkemeleri
              yetkilidir.
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">8. İletişim</h2>
            <p className="mt-2">MK Software (Melih Keleş), Yenimahalle, Ankara — destek@sosyalpanel.tr</p>
          </section>
        </div>

        <Link href="/" className="mt-10 inline-block text-sm text-brand hover:underline">← Ana sayfaya dön</Link>
      </div>
    </div>
  );
}
