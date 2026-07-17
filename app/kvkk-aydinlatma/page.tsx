import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";

export default function KvkkAydinlatmaPage() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicHeader />
      <div className="mx-auto max-w-2xl px-5 py-16 text-slateMute">
        <h1 className="font-display text-3xl font-bold text-slate">KVKK Aydınlatma Metni</h1>

        <div className="mt-4 rounded-lg border border-amber/40 bg-amber/10 p-4 text-sm text-amber">
          <strong>Önemli:</strong> Bu metin 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında
          genel bir taslaktır. Veri sorumlusu unvanını, VERBİS kaydını (gerekiyorsa) ve gerçek veri
          işleme süreçlerini yansıtacak şekilde bir hukuk danışmanına güncelletmelisin.
        </div>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed">
          <section>
            <h2 className="font-display font-semibold text-slate">Veri Sorumlusu</h2>
            <p className="mt-2">[Şirket unvanı], 6698 sayılı KVKK uyarınca "Veri Sorumlusu" sıfatıyla
              kişisel verilerinizi aşağıda açıklanan kapsamda işlemektedir.</p>
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
            <p className="mt-2">Yukarıdaki haklarınızı kullanmak için [başvuru e-postası / adresi] üzerinden
              bize ulaşabilirsiniz.</p>
          </section>
        </div>

        <Link href="/" className="mt-10 inline-block text-sm text-brand hover:underline">← Ana sayfaya dön</Link>
      </div>
    </div>
  );
}
