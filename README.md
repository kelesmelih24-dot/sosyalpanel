# SosyalPanel — SMM Panel

Next.js 14 (App Router) + Supabase + Vercel üzerine kurulu, tam fonksiyonel bir SMM
(sosyal medya pazarlama) panel iskeleti: üyelik, bakiye sistemi, sipariş sistemi ve
admin yönetim paneli içerir.

## Özellikler

- E-posta/şifre ile üyelik (Supabase Auth) + şifremi unuttum akışı
- Kayıt formunda Cloudflare Turnstile bot koruması (opsiyonel ama önerilir)
- Kullanıcı bakiyesi ve manuel bakiye yükleme talebi (havale/kripto), admin onayı ile
- Hizmet katalogu (kategori + hizmet), admin panelinden yönetilebilir
- Sipariş oluşturma: bakiye kontrolü + düşüşü tek bir atomik veritabanı fonksiyonuyla yapılır (`place_order`), yarış koşullarına karşı güvenlidir; ayrıca kullanıcı başına dakikada 10 sipariş sınırı vardır (spam koruması)
- **Tedarikçi (upstream SMM API) entegrasyonu**: JustAnotherPanel, Peakerr ve benzeri
  "Perfect Panel" uyumlu API sağlayan tüm tedarikçilerle çalışır. Admin panelinden
  tedarikçi ekle, hizmete bağla — sipariş verildiğinde otomatik olarak tedarikçiye iletilir
  ve `/api/cron/sync-orders` üzerinden durumu (tamamlandı, kısmi, iptal) periyodik senkronize edilir
- **Tedarikçi bakiye takibi**: aynı cron, tedarikçi bakiyelerini de kontrol eder; bakiye
  eşiğin altına düşerse admin panelinde uyarı banner'ı gösterir ve (ayarlıysan) bir
  Slack/Discord webhook'una bildirim gönderir
- **Sipariş durumu e-postaları**: sipariş tamamlandığında/iptal-iade olduğunda ve bakiye
  onaylandığında kullanıcıya e-posta gider (Resend ile, opsiyonel — anahtar yoksa sessizce atlanır)
- Çifte iade koruması: bir sipariş zaten iade/iptal edilmişse tekrar aynı duruma alınsa
  bile bakiye ikinci kez iade edilmez
- Kullanım Şartları, Gizlilik Politikası ve KVKK Aydınlatma Metni şablon sayfaları (footer'da bağlantılı, kayıt formunda onay kutusu ile)
- Admin paneli: hizmet CRUD, tedarikçi yönetimi, sipariş durumu güncelleme, kullanıcı/bakiye yönetimi
- **Açık temalı, pembe/magenta marka renkli vitrin sitesi** (rasyenmedya.com tarzı): üst iletişim çubuğu, platform bazlı "Hizmetler" açılır menüsü, her platform için gerçek verilerle çalışan kategori ve hizmet listeleme sayfaları (`/hizmetler/[platform]/[kategori]`), üye olmadan sipariş sorgulama (`/siparis-sorgula`)
- Admin/kullanıcı paneli (dashboard) ayrı, koyu temalı bir uygulama arayüzü olarak kalır — bu bilinçli bir tercih, çoğu SaaS'ta vitrin sitesi ile uygulama paneli farklı görünür

## Vitrin sitesindeki yer tutucular (canlıya almadan önce değiştir)

- `components/PublicHeader.tsx` ve birkaç sayfada geçen WhatsApp numarası (`905000000000`) ve
  `destek@sosyalpanel.com` adresi gerçek bilgilerinle değiştirilmeli
- `/iletisim` ve `/hakkimizda` sayfalarındaki `[...]` içindeki alanları doldur
- Ana sayfadaki platform ikonlarının bağlandığı kategoriler `supabase/schema.sql`'deki seed
  verisiyle geliyor — admin panelinden gerçek hizmetlerini eklemeyi unutma, yoksa kategori
  sayfaları "henüz hizmet eklenmedi" gösterir
- **Zaten kurulu bir Supabase projen varsa**: `schema.sql`'i tekrar baştan çalıştırma,
  var olan kategoriler kopyalanır. Bunun yerine SQL Editor'de sadece şunu çalıştır:
  ```sql
  insert into public.categories (name, platform, sort_order) values
    ('Twitter Takipçi', 'twitter', 7),
    ('Facebook Beğeni', 'facebook', 8),
    ('Spotify Dinlenme', 'spotify', 9),
    ('Pinterest Takipçi', 'pinterest', 10),
    ('LinkedIn Takipçi', 'linkedin', 11),
    ('SoundCloud Dinlenme', 'soundcloud', 12);
  ```

## Tedarikçi ekleme

1. Bir SMM API sağlayıcısında (JustAnotherPanel, Peakerr, SMMWIZ, Followiz, vb.)
   hesap aç ve API anahtarını al. Neredeyse hepsi aynı standart formatı kullanır,
   bu yüzden hangisini seçersen seç aynı entegrasyon çalışır.
2. Admin panelinde **Tedarikçiler** sayfasından adı, API URL'ini (`https://.../api/v2` gibi)
   ve API anahtarını gir.
3. "Servis listesini gör" ile tedarikçinin sunduğu hizmetleri ve ID'lerini gör.
4. **Hizmetler** sayfasında yeni hizmet eklerken bu tedarikçiyi ve ilgili servis ID'sini seç,
   kendi satış fiyatını (₺ / 1000) belirle. Sipariş verildiğinde sistem otomatik olarak
   tedarikçiye iletir ve durumunu takip eder.
5. Tedarikçisi olmayan hizmetler "manuel işlenecek" olarak kalır — admin, Siparişler
   sayfasından durumunu elle güncelleyebilir (kendi ekibin/botların üretiyorsa bu moda uygun).

### Sipariş durumu senkronizasyonu (cron)

`app/api/cron/sync-orders` rotası, tedarikçiye iletilmiş bekleyen siparişlerin durumunu
çeker. Vercel'de proje ayarlarına `CRON_SECRET` adında rastgele bir gizli değer ekle;
repodaki `vercel.json` bu rotayı her 10 dakikada bir tetikleyecek şekilde ayarlanmıştır
(Vercel projenin Cron Jobs sekmesinden bunu görebilir/düzenleyebilirsin).

## Kurulum

### 1) Supabase projesi

1. [supabase.com](https://supabase.com) üzerinde yeni bir proje oluştur.
2. Proje panelinde **SQL Editor**'ü aç, bu repodaki `supabase/schema.sql` dosyasının
   tamamını yapıştır ve çalıştır. Bu işlem tabloları, RLS politikalarını, tetikleyicileri
   ve `place_order` / `admin_adjust_balance` fonksiyonlarını oluşturur.
3. **Project Settings → API** sayfasından `Project URL`, `anon public` anahtarını ve
   `service_role` anahtarını al.
4. İlk admin kullanıcını oluşturmak için: siteden normal şekilde kayıt ol, sonra
   Supabase **Table Editor → profiles** tablosunda kendi satırındaki `role` alanını
   `admin` olarak değiştir.

### 2) Ortam değişkenleri

`.env.example` dosyasını `.env.local` olarak kopyala ve Supabase bilgilerini gir:

```bash
cp .env.example .env.local
```

### 3) Yerel geliştirme

```bash
npm install
npm run dev
```

Site `http://localhost:3000` adresinde açılır.

### 4) GitHub + Vercel

1. Bu klasörü bir GitHub deposuna push et.
2. [vercel.com](https://vercel.com) üzerinden "New Project" ile bu repoyu içe aktar.
3. Vercel proje ayarlarında **Environment Variables** kısmına `.env.local`
   içindeki üç değişkeni ekle (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
4. Deploy et. Her `git push` sonrası Vercel otomatik yeniden deploy eder.
5. Supabase **Authentication → URL Configuration** kısmına Vercel domainini
   (`https://senin-domainin.vercel.app`) `Site URL` ve `Redirect URLs` olarak ekle,
   yoksa e-posta onay linkleri çalışmaz.

### 5) Yasal sayfalar (önemli)

`app/kullanim-sartlari`, `app/gizlilik-politikasi` ve `app/kvkk-aydinlatma` altında
taslak sayfalar hazır ama **köşeli parantez `[...]` içindeki tüm alanları** (şirket
unvanı, adres, iade politikası vb.) doldurup bir avukata/mali müşavire onaylatmadan
canlıya alma. Bunlar hukuki tavsiye değildir.

### 6) Bot koruması (Cloudflare Turnstile) — opsiyonel

1. [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) üzerinden ücretsiz bir site anahtarı al.
2. `NEXT_PUBLIC_TURNSTILE_SITE_KEY` değişkenine site anahtarını gir.
3. Supabase Dashboard → Authentication → Attack Protection → Captcha kısmına secret anahtarı gir ve etkinleştir.
4. Boş bırakırsan kayıt formu captcha olmadan çalışmaya devam eder.

### 7) Düşük bakiye / durum bildirimleri — opsiyonel

- `ALERT_WEBHOOK_URL` değişkenine bir Slack veya Discord "Incoming Webhook" URL'i
  girersen, tedarikçi bakiyesi eşiğin altına düştüğünde otomatik bildirim alırsın.
- `RESEND_API_KEY` girersen (ücretsiz [resend.com](https://resend.com) hesabıyla),
  müşterilere sipariş durumu ve bakiye onayı e-postaları otomatik gider. Boş
  bırakırsan e-postalar sessizce gönderilmez, başka hiçbir şey bozulmaz.

## Eklemen gereken parçalar (production için)

Bu iskelet sadece **ödeme altyapısını** kasıtlı olarak dışarıda bırakır çünkü hangi
sağlayıcıyı seçtiğine göre değişir:

- **Ödeme altyapısı**: şu an bakiye yükleme, kullanıcının "ödeme yaptım" dediği bir
  talep oluşturup admin'in elle onaylamasıyla çalışır (`/dashboard/bakiye-yukle`).
  Kartlı ödeme için iyzico, PayTR veya Stripe gibi bir sağlayıcıyı
  `app/api/topup/route.ts` içine entegre edebilirsin.

Hazır olmayan ama "acil değil" kategorisindeki diğer geliştirmeler: iki adımlı
doğrulama (2FA), sipariş geçmişinde arama/filtreleme, canlı destek widget'ı.

## Klasör yapısı

```
app/
  page.tsx                 → Vitrin/landing sayfası
  giris/, kayit/           → Giriş ve kayıt
  dashboard/               → Kullanıcı paneli (bakiye, sipariş, geçmiş)
  admin/                   → Yönetim paneli (hizmetler, siparişler, kullanıcılar)
  api/                     → Route handler'lar (sipariş, bakiye, admin işlemleri)
lib/supabase/              → Supabase istemcileri (browser, server, admin)
supabase/schema.sql        → Tüm veritabanı şeması + RLS + fonksiyonlar
```
