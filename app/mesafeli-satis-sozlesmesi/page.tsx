import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";

export default function MesafeliSatisPage() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicHeader />
      <div className="mx-auto max-w-2xl px-5 py-16 text-slateMute">
        <h1 className="font-display text-3xl font-bold text-slate">Mesafeli Satış Sözleşmesi</h1>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed">
          <section>
            <h2 className="font-display font-semibold text-slate">Madde 1 — Taraflar</h2>
            <p className="mt-2">
              <strong>Satıcı:</strong> MK Software (Melih Keleş), Yenimahalle, Ankara, Vergi No: 5431084511<br />
              <strong>Alıcı:</strong> Sipariş sırasında bilgileri alınan müşteri
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">Madde 2 — Sözleşmenin Konusu</h2>
            <p className="mt-2">
              İşbu sözleşme, Alıcı'nın Satıcı'ya ait internet sitesinden elektronik ortamda sipariş verdiği
              sosyal medya etkileşim hizmetinin satışı ve ifasıyla ilgili tarafların hak ve yükümlülüklerini
              düzenler.
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">Madde 3 — Hizmetin Niteliği ve Ücreti</h2>
            <p className="mt-2">
              Hizmet bilgileri (adı, açıklaması, miktarı, fiyatı) sipariş sırasında Alıcı'ya gösterilir ve
              onayı alınır. Fiyatlara KDV dahildir.
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">Madde 4 — Cayma Hakkı</h2>
            <p className="mt-2">
              Hizmet, Alıcı'nın onayı ile ifasına hemen başlanan ve niteliği gereği iadesi mümkün olmayan
              elektronik ortamda anında ifa edilen hizmetler kapsamındadır. Mesafeli Sözleşmeler
              Yönetmeliği'nin ilgili maddeleri uyarınca, ifasına başlanan bu tür hizmetlerde cayma hakkı
              kullanılamaz.
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">Madde 5 — Ödeme ve Teslimat</h2>
            <p className="mt-2">
              Ödeme banka havalesi/EFT ile alınır. Ödeme dekontu onaylandıktan sonra hizmet işleme alınır.
              Teslimat süresi hizmetin niteliğine göre değişir ve sipariş sayfasında belirtilir.
            </p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-slate">Madde 6 — Uyuşmazlıkların Çözümü</h2>
            <p className="mt-2">
              İşbu sözleşmeden doğan uyuşmazlıklarda Ankara Tüketici Hakem Heyetleri ve Tüketici
              Mahkemeleri yetkilidir.
            </p>
          </section>
        </div>

        <Link href="/" className="mt-10 inline-block text-sm text-brand hover:underline">← Ana sayfaya dön</Link>
      </div>
    </div>
  );
}
