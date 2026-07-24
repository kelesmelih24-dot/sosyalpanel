import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";

export default function KvkkAydinlatmaPage() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicHeader />
      <div className="mx-auto max-w-2xl px-5 py-16 text-slateMute">
        <h1 className="font-display text-3xl font-bold text-slate">KVKK Aydınlatma Metni</h1>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed">
          <section>
            <h2 className="font-display font-semibold text-slate">Veri Sorumlusu</h2>
            <p className="mt-2">MK Software (Melih Keleş), Yenimahalle, Ankara — 6698 sayılı KVKK uyarınca
              "Veri Sorumlusu" sıfatıyla kişisel verilerinizi aşağıda açıklanan kapsamda işlemektedir.</p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">İşlenen Kişisel Veriler</h2>
            <p className="mt-2">Ad soyad, e-posta adresi, sipariş ve işlem geçmişi, bakiye yükleme
              notlarında paylaşılan bilgiler.</p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">İşleme Amaçları ve Hukuki Sebep</h2>
            <p className="mt-2">Üyelik sözleşmesinin kurulması ve ifası, hizmetlerin sunulması, yasal
              yükümlülüklerin yerine getirilmesi (KVKK m.5/2).</p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">Veri Sahibinin Hakları (KVKK m.11)</h2>
            <ul className="mt-2 list-disc pl-5">
              <li>Kişisel verinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme</li>
              <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Eksik/yanlış işlenmişse düzeltilmesini isteme</li>
              <li>Silinmesini veya yok edilmesini isteme</li>
              <li>İşlenen verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
              <li>Aleyhine bir sonucun ortaya çıkmasına itiraz etme</li>
              <li>Zarara uğraması hâlinde zararın giderilmesini talep etme</li>
            </ul>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">Başvuru Yöntemi</h2>
            <p className="mt-2">Yukarıdaki haklarınızı kullanmak için destek@sosyalpanel.tr üzerinden
              bize ulaşabilirsiniz. Sipariş verilerinizin kalıcı olarak silinmesini doğrudan{" "}
              <Link href="/veri-silme-talebi" className="text-brand hover:underline">Veri Silme Talebi</Link> sayfamızdan da isteyebilirsiniz.</p>
          </section>
        </div>

        <Link href="/" className="mt-10 inline-block text-sm text-brand hover:underline">← Ana sayfaya dön</Link>
      </div>
    </div>
  );
}
