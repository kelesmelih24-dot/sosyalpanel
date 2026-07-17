# SosyalPanel — SMM Panel

Next.js 14 (App Router) + Supabase üzerine kurulu bir SMM (sosyal medya pazarlama)
panel sitesi: **üyelik yok, bakiye sistemi yok**. Müşteri hizmeti seçer, ödemeyi
banka hesabına yapar, dekontunu yükler; sen (admin) Telegram'dan anında haber
alır, dekontu kontrol edip onaylarsın — sipariş otomatik işleme girer.

## Nasıl çalışır (müşteri tarafı)

1. Müşteri `/hizmetler/[platform]` üzerinden bir kategori, oradan bir hizmet seçer
2. "Sipariş Ver" ile `/misafir-siparis` sayfasına gider — hesap açmasına gerek yoktur
3. Hedef link, miktar, e-posta ve ödeme dekontunu (fotoğraf/PDF) yükler
4. Sipariş "ödeme bekleniyor" durumunda oluşur, **sana Telegram'dan anında bildirim gider**
5. Admin panelinden dekontu görüntüleyip onaylarsın (durumu "Beklemede"ye çekersin)
6. Tedarikçi bağlıysa sipariş otomatik iletilir; değilse elle işlersin
7. Müşteri `/siparis-sorgula`'dan sipariş no + e-posta ile durumu takip eder

Not: Admin/yönetici girişi (`/giris`) hâlâ var — bu sadece SENİN panele girmen
içindir, müşteriler hiçbir zaman hesap açmaz veya giriş yapmaz.

## Özellikler

- **Üye olmadan sipariş + dekont yükleme**: `/misafir-siparis` — link, miktar,
  e-posta ve ödeme dekontu (görsel/PDF) ile sipariş oluşturulur, dosya Supabase
  Storage'a (özel/private bucket) yüklenir.
- **Telegram bildirimi**: dekont yüklenir yüklenmez sana Telegram'dan mesaj gider
  (sipariş no, hizmet, tutar, e-posta, link). Kurulumu aşağıda.
- **Binlerce yer tutucu hizmet**: `supabase/seed_services.sql` çalıştırdığında
  10 platform × onlarca kategori × 30 kalite/hız varyasyonuyla ~2000+ hizmet
  otomatik oluşur, fiyatlar 200 ₺'den başlar. **Bunlar gerçek fiyat/isim değildir**,
  canlıya almadan önce admin panelinden güncellemen gerekir (aşağıda detay var).
- Admin paneli: hizmet/kategori CRUD, tedarikçi yönetimi, sipariş durumu güncelleme
  + dekont görüntüleme, gerçek müşteri değerlendirmeleri
- **Tedarikçi (upstream SMM API) entegrasyonu**: JustAnotherPanel, Peakerr ve
  benzeri "Perfect Panel" uyumlu API sağlayan tedarikçilerle çalışır. Admin
  onayladığında (dekont onayı = ödeme bekleniyor → beklemede) sipariş otomatik
  tedarikçiye iletilir, `/api/cron/sync-orders` durumu senkronize eder.
- **Gerçek değerlendirme sistemi**: sahte yıldız puanı yok. `/admin/degerlendirmeler`
  sayfasından gerçek müşteri yorumu eklersin, anasayfadaki puan ve yorumlar
  buradan otomatik hesaplanır. Hiç eklemezsen o bölüm hiç görünmez.
- Güven rozetleri, sağ altta sabit Whatsapp butonu, gerçek bir bitiş tarihine
  bağlı (sahte olmayan) kampanya banner'ı
- Açık temalı, pembe/magenta marka renkli vitrin sitesi; platform bazlı
  "Hizmetler" menüsü; üye olmadan sipariş sorgulama (`/siparis-sorgula`)

## Kurulum

### 1) Supabase projesi

1. [supabase.com](https://supabase.com) üzerinde yeni bir proje oluştur.
2. **SQL Editor**'de `supabase/schema.sql` dosyasının tamamını çalıştır (tablolar,
   RLS, fonksiyonlar, storage bucket). Bu dosya güvenle tekrar tekrar çalıştırılabilir.
3. Ardından `supabase/seed_services.sql` dosyasını çalıştır — kategorileri
   genişletir ve ~2000 yer tutucu hizmeti 200 ₺'den başlayan fiyatlarla oluşturur.
   Bu dosya da güvenle tekrar çalıştırılabilir (kopya oluşturmaz).
4. **Project Settings → API**'den Project URL, `anon public` ve `service_role`
   anahtarlarını al.

### 2) Kendi admin hesabını oluştur

Müşteri kaydı yok ama SEN panele girebilmelisin:

1. Supabase Dashboard → **Authentication → Users → Add user** ile kendi
   e-posta/şifreni gir (veya "Invite" ile davet e-postası gönder).
2. **Table Editor → profiles** tablosunda kendi satırını bul, **role** sütununu
   `admin` yap.
3. Sitede `/giris` sayfasından bu bilgilerle giriş yap — otomatik `/admin`
   paneline yönlendirilirsin.

### 3) Ortam değişkenleri

`.env.example` dosyasını `.env.local` olarak kopyala ve doldur:

```bash
cp .env.example .env.local
```

### 4) Telegram bildirimi kurulumu (bot token'ın var, chat ID'n yok ise)

1. Telegram'da bot'unla (BotFather ile oluşturduğun) bir konuşma başlat, bot'a
   herhangi bir mesaj gönder (örn. "merhaba").
2. Tarayıcıda şu adresi aç (TOKEN yerine kendi bot token'ını yaz):
   `https://api.telegram.org/botTOKEN/getUpdates`
3. Dönen JSON içinde `"chat":{"id":123456789, ...}` şeklinde bir alan göreceksin —
   o sayı senin **chat ID**'n.
4. `.env.local` (ve Vercel/Netlify ortam değişkenlerine) şunları ekle:
   ```
   TELEGRAM_BOT_TOKEN=bot_token_burada
   TELEGRAM_CHAT_ID=bulduğun_sayı
   ```
5. Bir test siparişi verip dekont yükle — Telegram'dan anında mesaj gelmeli.

Grup sohbetine bildirim göndermek istersen: botu o gruba ekle, gruba bir mesaj
yazdır, sonra aynı `getUpdates` adresinde grup için negatif bir chat id
(örn. `-1001234567890`) göreceksin, onu kullan.

### 5) Yerel geliştirme

```bash
npm install
npm run dev
```

### 6) GitHub + Vercel (veya Netlify)

1. Bu klasörü bir GitHub deposuna push et.
2. Vercel/Netlify'de projeyi import et, ortam değişkenlerini gir, deploy et.
3. Supabase **Authentication → URL Configuration** kısmına yayın adresini
   `Site URL` ve `Redirect URLs` olarak ekle.

## Canlıya almadan önce mutlaka yap

- **Hizmet kataloğunu gözden geçir**: `seed_services.sql` ile gelen ~2000 hizmet
  yer tutucudur. Admin panelinden (Hizmetler sayfası) gerçek maliyetlerine göre
  fiyatları güncelle, kullanmayacağın hizmetleri pasife al/sil.
- **Ödeme bilgilerini gir**: `lib/constants.ts` içindeki `BANK_INFO` alanına
  gerçek IBAN/banka bilgilerini yaz — şu an tüm sipariş sayfalarında bu tek
  yerden okunuyor.
- **Telegram bildirimini test et**: yukarıdaki adımlarla kur ve gerçek bir test
  siparişiyle doğrula.
- **Whatsapp numarası**: `components/PublicHeader.tsx`, `components/FloatingWhatsapp.tsx`,
  `app/iletisim/page.tsx` içindeki `905000000000` numarasını gerçek numaranla değiştir.
- **Yasal sayfalar**: `app/kullanim-sartlari`, `app/gizlilik-politikasi`,
  `app/kvkk-aydinlatma` içindeki `[...]` alanlarını doldurup bir avukata/mali
  müşavire onaylat — bunlar taslak, hukuki tavsiye değildir.
- **Gerçek değerlendirme ekle**: `/admin/degerlendirmeler`'den ilk birkaç gerçek
  müşteri yorumunu gir, yoksa o bölüm anasayfada hiç görünmez (bu istenen davranış).

## Tedarikçi ekleme (siparişlerin otomatik teslim edilmesi için)

1. Bir SMM API sağlayıcısında (JustAnotherPanel, Peakerr, SMMWIZ, Followiz, vb.)
   hesap aç ve API anahtarını al.
2. Admin panelinde **Tedarikçiler** sayfasından adı, API URL'ini ve API
   anahtarını gir.
3. "Servis listesini gör" ile tedarikçinin sunduğu hizmetleri ve ID'lerini gör.
4. **Hizmetler** sayfasında ilgili hizmete bu tedarikçiyi ve servis ID'sini bağla.
   Dekont onaylandığında (ödeme bekleniyor → beklemede) sipariş otomatik
   tedarikçiye iletilir ve durumu takip edilir.
5. Tedarikçisi olmayan hizmetler admin tarafından elle işlenir.

### Sipariş durumu senkronizasyonu (cron)

`app/api/cron/sync-orders` rotası, tedarikçiye iletilmiş siparişlerin durumunu
çeker ve tedarikçi bakiyesini kontrol eder. Vercel Cron (`vercel.json` hazır) veya
[cron-job.org](https://cron-job.org) gibi ücretsiz bir servisle her 10 dakikada
bir bu adrese `Authorization: Bearer CRON_SECRET` header'ıyla istek attır.

## Eklemen gereken parçalar (production için)

- **Kartlı ödeme**: şu an sadece "dekont yükle, admin onaylasın" akışı var.
  Otomatik kartlı ödeme istersen iyzico/PayTR gibi bir sağlayıcı entegre edilebilir.
- İki adımlı doğrulama (2FA), sipariş geçmişinde arama/filtreleme, canlı destek
  widget'ı gibi geliştirmeler henüz yok.

## Klasör yapısı

```
app/
  page.tsx                       → Vitrin/landing sayfası
  giris/                         → SADECE admin girişi (müşteri kaydı yok)
  misafir-siparis/               → Üye olmadan sipariş + dekont yükleme
  siparis-sorgula/               → Sipariş no + e-posta ile durum takibi
  hizmetler/[platform]/          → Platform bazlı kategori/hizmet listeleme
  admin/                         → Yönetim paneli (hizmetler, tedarikçiler, siparişler, değerlendirmeler)
  api/                           → Route handler'lar (misafir sipariş, admin işlemleri, cron)
lib/
  constants.ts                   → Banka hesap bilgileri (tek yerden düzenle)
  telegram.ts                    → Telegram bildirim yardımcı fonksiyonu
  smmProvider.ts                 → Tedarikçi API entegrasyonu
supabase/
  schema.sql                     → Veritabanı şeması + RLS + fonksiyonlar + storage bucket
  seed_services.sql              → Binlerce yer tutucu kategori/hizmet oluşturur
```
