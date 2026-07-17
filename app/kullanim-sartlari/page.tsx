import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";

export default function KullanimSartlariPage() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicHeader />
      <div className="mx-auto max-w-2xl px-5 py-16 text-slateMute">
        <h1 className="font-display text-3xl font-bold text-slate">Kullanım Şartları</h1>

        <div className="mt-4 rounded-lg border border-amber/40 bg-amber/10 p-4 text-sm text-amber">
          <strong>Önemli:</strong> Bu sayfa genel bir taslaktır ve hukuki tavsiye niteliği taşımaz.
          Yayına almadan önce bir avukata veya mali müşavire onaylatman, şirket unvanını, MERSİS/vergi
          numaranı, iletişim adresini ve gerçek uyuşmazlık çözüm yerini kendi bilgilerinle güncellemen gerekir.
        </div>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed">
          <section>
            <h2 className="font-display font-semibold text-slate">1. Taraflar</h2>
            <p className="mt-2">
              Bu kullanım şartları, [Şirket Unvanı] ("Panel") ile platformu kullanan üye ("Kullanıcı")
              arasındaki ilişkiyi düzenler. Panele üye olarak bu şartları kabul etmiş sayılırsınız.
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
            <h2 className="font-display font-semibold text-slate">4. Bakiye ve Ödemeler</h2>
            <p className="mt-2">
              Bakiye yükleme talepleri, ödemenin doğrulanmasının ardından onaylanır ve kullanıcı hesabına
              yansıtılır. Yüklenen bakiye yalnızca panel içi hizmet satın alımında kullanılabilir.
              [İade/nakde çevirme politikanı buraya ekle.]
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">5. Sipariş İptali ve İade</h2>
            <p className="mt-2">
              Sipariş "beklemede" durumundayken destek ekibinden iptal talep edilebilir. İşleme alınmış
              siparişlerde iade, tedarikçinin iade politikasına tabidir. [Kendi iade politikanı buraya yaz.]
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
              İşbu sözleşmeden doğan uyuşmazlıklarda [şehir] Tüketici Hakem Heyetleri ve Mahkemeleri
              yetkilidir. [Bu maddeyi mutlaka bir hukuk danışmanına onaylat.]
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">8. İletişim</h2>
            <p className="mt-2">[Şirket adresi, e-posta, telefon bilgilerini buraya ekle.]</p>
          </section>
        </div>

        <Link href="/" className="mt-10 inline-block text-sm text-brand hover:underline">← Ana sayfaya dön</Link>
      </div>
    </div>
  );
}
