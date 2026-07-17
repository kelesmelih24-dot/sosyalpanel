# SosyalPanel — SMM Panel

Next.js 14 (App Router) + Supabase üzerine kurulu bir SMM (sosyal medya pazarlama)
panel sitesi: **üyelik yok, bakiye sistemi yok**. Müşteri hizmeti seçer, ödemeyi
banka hesabına yapar, dekontunu yükler; sen (admin) Telegram'dan anında haber
alır, dekontu kontrol edip onaylarsın — sipariş otomatik işleme girer.

## Nasıl çalışır (müşteri tarafı)

1. Müşteri `/hizmetler/[platform]` üzerinden bir kategori, oradan bir hizmet seçer,
   miktarı kartın üzerinden seçip "Sipariş Ver" der
2. `/misafir-siparis` sayfasında hedef link + e-posta girer, **sipariş bu an oluşur**
   (henüz dekont yok) — hesap açmasına gerek yoktur
3. Ödeme bilgilerini ve kişiye özel "Dekontu Yükle" bağlantısını **e-postasına**
   otomatik olarak göndeririz (ekranda da aynı bilgiler + buton gösterilir,
   e-posta gelmezse de devam edebilir)
4. Müşteri ödemeyi yaptıktan sonra o bağlantıdan dekontunu (fotoğraf/PDF) yükler
5. Dekont yüklenir yüklenmez **sana Telegram'dan anında bildirim gider**
6. Admin panelinden dekontu görüntüleyip onaylarsın (durumu "Beklemede"ye çekersin)
7. Tedarikçi bağlıysa sipariş otomatik iletilir; değilse elle işlersin
8. Müşteri `/siparis-sorgula`'dan sipariş no + e-posta ile durumu her an takip eder

Not: Admin/yönetici girişi (`/giris`) hâlâ var — bu sadece SENİN panele girmen
içindir, müşteriler hiçbir zaman hesap açmaz veya giriş yapmaz.

## Önemli: e-posta artık kritik bir adım

Ödeme bilgileri ve dekont yükleme linki müşteriye **e-posta ile** gönderiliyor.
Bu yüzden `RESEND_API_KEY` ve `RESEND_FROM_EMAIL` ortam değişkenlerini mutlaka
ayarla (ücretsiz [resend.com](https://resend.com) hesabıyla) — ayarlamazsan
müşteri e-postayı alamaz. Yine de ekranda aynı bilgiler + "Dekontu Yükle" butonu
gösterildiği için müşteri e-posta gelmese de sipariş ekranından devam edebilir,
ama e-postayı kurman şiddetle önerilir. Ayrıca `NEXT_PUBLIC_SITE_URL` değişkeninin
doğru (gerçek) domain'ine ayarlı olduğundan emin ol — e-postadaki link bu değeri kullanır.

**⚠️ Domain doğrulaman gerekiyor (kritik):** Bir domain doğrulamadan Resend'in
`onboarding@resend.dev` adresi **sadece kendi Resend hesabına kayıtlı e-postana**
(kayıt olurken kullandığın adrese) e-posta gönderebilir — başka hiçbir e-posta
adresine (yani gerçek müşterilerine) e-posta GİTMEZ. Bunu düzeltmek için:
1. Bir domain satın al (yoksa Cloudflare Registrar veya Namecheap gibi ucuz
   sağlayıcılardan alabilirsin, ~yılda 200-400₺ civarı)
2. Resend Dashboard → **Domains → Add Domain**, verdiği DNS kayıtlarını
   domain sağlayıcındaki DNS ayarlarına ekle (genelde 15-30 dk içinde doğrulanır)
3. `RESEND_FROM_EMAIL`'i `SosyalPanel <bildirim@seninalanadin.com>` şeklinde güncelle
4. Domain doğrulanana kadar sistemi sadece **kendi e-postanla** test edebilirsin,
   gerçek müşteriye açmadan önce bu adımı tamamlaman gerekiyor.

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
   genişletir ve ~2000 hizmeti gerçekçi açıklamalar ve çeşitli miktar
   aralıklarıyla, 200 ₺'den başlayan fiyatlarla oluşturur. Bu dosyayı istediğin
   kadar tekrar çalıştırabilirsin: aynı isimdeki hizmet zaten varsa açıklama/
   fiyat/miktar bilgilerini bu script'teki güncel değerlerle yeniden yazar
   (kopya oluşturmaz, önceki sürümde eklenmiş tekdüze verileri de düzeltir).
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
çeker ve tedarikçi bakiyesini kontrol eder. `app/api/cron/expire-orders` rotası
ise 12 saat sonra ödeme hatırlatması gönderir, 24 saat sonra otomatik iptal
eder ve yüksek sipariş hacminde uyarı verir.

**Önemli — Vercel Hobby (ücretsiz) plan sınırlaması:** Vercel'in ücretsiz planı
cron job'ların **günde sadece 1 kez** çalışmasına izin veriyor; daha sık
(`*/10 * * * *` gibi) bir ayar **deploy'u tamamen başarısız eder**. Bu yüzden
`vercel.json`'daki cron'ları günde bir kez çalışacak şekilde bıraktım (sadece
deploy'un bozulmaması için). Ama bu iki işlem için günde 1 kez yetersiz —
siparişlerin durumu ve 24 saatlik iptal/hatırlatma çok daha sık kontrol edilmeli.

**Çözüm:** [cron-job.org](https://cron-job.org) gibi ücretsiz bir dış servise
kaydolup, her iki adrese de **ayrı ayrı** sık aralıklarla (örn. 10-15 dakikada
bir) istek attır:

- `https://sitenadi.vercel.app/api/cron/sync-orders`
- `https://sitenadi.vercel.app/api/cron/expire-orders`

İkisinde de `Authorization: Bearer CRON_SECRET` header'ını eklemeyi unutma
(`CRON_SECRET` ortam değişkenine ne yazdıysan onu). Bu şekilde Vercel'in günlük
sınırını hiç önemsemeden istediğin sıklıkta çalıştırabilirsin.

## Eklemen gereken parçalar (production için)

- **Kartlı ödeme**: şu an sadece "dekont yükle, admin onaylasın" akışı var.
  Otomatik kartlı ödeme istersen iyzico/PayTR gibi bir sağlayıcı entegre edilebilir.
- İki adımlı doğrulama (2FA), sipariş geçmişinde arama/filtreleme, canlı destek
  widget'ı gibi geliştirmeler henüz yok.

## Faz 2-6: Değerlendirme, Referans, AI Destek, Blog, Admin, Tasarım

Bu bölüm en son eklenen büyük özellik setini anlatır.

### Değerlendirme sistemi + AI moderasyon

- `/degerlendirme` — müşteri kendi yorumunu girer (isim, e-posta opsiyonel, puan, yorum).
- Yorum, Groq API (Llama 3.3) ile **otomatik** kontrol edilir (küfür/spam/alakasız içerik var mı) —
  admin onayı beklemez, uygunsa direkt yayınlanır. `GROQ_API_KEY` ayarlı değilse
  güvenlik için hiçbir yorum otomatik yayınlanmaz (admin panelinden elle onaylanabilir).
- İlk yorumunu bırakan müşteriye otomatik %5, 30 gün geçerli tek kullanımlık kupon kodu
  e-posta ile gönderilir.
- Sipariş tamamlandı e-postasında "Değerlendirme Bırak" butonu otomatik yer alır.

### Referans programı

- `/referans` — müşteri e-postasını girip kendine özel davet linkini alır.
- Link paylaşıldığında (`?ref=KOD`), yeni müşteri ilk siparişinde otomatik %5 indirim kazanır.
- Davet eden kişi, davet ettiği kişinin siparişi **tamamlandığında** %5 indirim kodu kazanır (e-posta ile gönderilir).
- Bir kod en fazla 10 kez kullanılabilir (kötüye kullanım sınırı).

### Kupon/indirim önceliği

Sipariş formunda: **girilen kupon kodu > referans linki > ilk sipariş hoşgeldin indirimi**
— aynı anda sadece biri uygulanır, asla üst üste binmez.

### AI Canlı Destek

Sağ altta bir sohbet balonu — Groq API (Llama 3.3) ile çalışır, sitenin politikalarını (iade yok,
min. tutar, KDV dahil, dekont süreci vb.) bilir. Cevaplayamadığı veya hesaba özel/hassas
bir durum olduğunu tespit ettiğinde otomatik olarak **Telegram'a** bildirim gönderir.
`GROQ_API_KEY` ayarlı değilse widget "Whatsapp'tan yaz" gibi bir mesaj gösterir,
hiçbir şey bozulmaz. Sistemin bildiği politikaları `app/api/ai-chat/route.ts` içindeki
`SYSTEM_PROMPT` metninde düzenleyebilirsin — gerçek müşteri senaryolarını buraya ekleyerek
asistanı daha isabetli hale getirebilirsin.

### Blog

- `/admin/blog` — "✨ AI ile Yaz" butonuna bir konu yazıp basman yeterli, AI taslak
  yazı üretir; düzenleyip yayınlarsın. Kapak görseli olarak gerçek bir görsel API'si
  bağlı değil (ücretsiz/basit tutmak için) — bunun yerine seçtiğin renklerle gradient
  bir kapak oluşturuluyor.
- `supabase/seed_blog.sql` — elle yazılmış 6 başlangıç yazısıyla geliyor, tekrar
  çalıştırmak güvenli (kopya oluşturmaz).

### Yardım Merkezi

`/yardim` — anahtar kelimeyle anında filtrelenen, SSS'den daha kapsamlı bir bilgi tabanı.

### Admin geliştirmeleri

- **Çoklu admin + yetki seviyesi**: `profiles.role` artık `admin` veya `destek` olabilir.
  `destek` rolü sadece Siparişler ve Değerlendirmeler sayfalarını görür; Hizmetler,
  Tedarikçiler, Blog, Yöneticiler sayfalarına erişemez (hem menüden gizli hem API'de
  engellenmiş). Birine destek yetkisi vermek için Supabase Table Editor'de
  `profiles.role` alanını `destek` yap.
- Siparişler sayfasında arama/filtre + CSV export butonu.
- Genel Bakış'ta son 14 gün ciro grafiği + en çok satan 5 hizmet listesi.
- Hizmetler sayfasında manuel "⭐ Çok Satan" rozeti — vitrin sitesinde hizmet
  kartlarında görünür.
- Sipariş başına PDF fatura yükleme (`Fatura Yükle` butonu) — müşteri "Sipariş
  Sorgula"dan indirebiliyor, yüklendiğinde otomatik e-posta gidiyor.
- Haftalık satış raporu — her Pazartesi Telegram'a (+ `ADMIN_REPORT_EMAIL` ayarlıysa
  e-postaya da) gönderilir.
- Yüksek sipariş hacmi uyarısı — haftada 1000+ sipariş olursa Telegram'a bildirim gider.

### 24 saat otomatik iptal + hatırlatma

`app/api/cron/expire-orders` — 12. saatte e-posta hatırlatması, 24. saatte otomatik iptal.
**Not:** Müşteriye WhatsApp hatırlatması henüz gönderilmiyor — bunun için Meta WhatsApp
Cloud API (ücretsiz) veya Twilio (ücretli) gibi bir sağlayıcıya ihtiyaç var; hangisini
seçersen kodun ilgili yerine (`app/api/cron/expire-orders/route.ts` içindeki TODO) entegre
edebilirim, sağlayıcı hesabı açtığında haber ver.

### Kara mod

Sağ üstteki 🌙/☀️ butonuyla açılıp kapanıyor, tarayıcı/sistem tercihine göre varsayılan
olarak da başlıyor. **Not:** Zaman kısıtı nedeniyle şu an sadece üst menüde tam kara mod
desteği var; diğer sayfalar (hizmet kategorileri, yasal sayfalar vb.) şimdilik hep açık
temada kalıyor. İstersen bunu diğer sayfalara da genişletebilirim.

### Google Analytics

`NEXT_PUBLIC_GA_MEASUREMENT_ID` ortam değişkenine **bu site için yeni oluşturduğun**
bir GA4 mülkünün ölçüm ID'sini (G- ile başlar) gir. Boş bıraksan hiçbir şey yüklenmez.

### KVKK Veri Silme Talebi

`/veri-silme-talebi` — müşteri sipariş no + e-postasıyla kendi kişisel verilerinin
(e-posta, link, dekont, fatura) kalıcı olarak silinmesini talep edebilir. Bu geri
alınamaz bir işlemdir, sipariş kaydı istatistik amaçlı anonim olarak kalır.

## Bu güncellemeden sonra yapman gerekenler

1. `supabase/schema.sql`'i tekrar çalıştır (yeni tablolar: `discount_codes`,
   `referral_codes`, `referral_redemptions`, `blog_posts`, yeni kolonlar).
2. `supabase/seed_blog.sql`'i çalıştır (6 başlangıç blog yazısı).
3. `GROQ_API_KEY` al ([console.groq.com](https://console.groq.com), tamamen ücretsiz, kredi kartı istemez) ve
   ortam değişkenlerine ekle — AI moderasyon, AI destek ve AI blog yazımı için gerekli.
4. İstersen `NEXT_PUBLIC_GA_MEASUREMENT_ID` ve `ADMIN_REPORT_EMAIL` ekle.
5. Kendi hesabını `admin` olarak bıraktın, ileride ekleyeceğin destek elemanına
   `destek` rolü ver.

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
