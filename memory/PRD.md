# Herbalife E-Ticaret Sitesi - PRD

## Orijinal Problem Tanımı
Modern, mobil uyumlu, beyaz-yeşil-siyah renk temalı Herbalife ürünleri e-ticaret sitesi.

## Temel Gereksinimler

### Ana Sayfa
- ✅ Slider (Video veya Resim) - admin panelden yönetiliyor, PC'den resim yükleme
- ✅ Kampanya banner'ı
- ✅ Ürün kartları (spotlight stil)
- ✅ Üst duyuru çubuğu (TopBar) - yeşil, siyah yazılı
- ✅ Dinamik footer
- ✅ **Ürün sıralama seçenekleri** (Varsayılan, Fiyat Artan, Fiyat Azalan)

### E-Ticaret Akışı
- ✅ Ürün detay sayfası (varyant seçimi, resim değişimi)
- ✅ Sepet sayfası (ekleme/çıkarma, miktar ayarlama)
- ✅ Ödeme sayfası (Havale/EFT)
- ✅ Sipariş takip sayfası (HRB-XXXXXX kodu ile)

### Ürün Özellikleri
- ✅ Her varyantın kendine özel resmi
- ✅ Her varyantın stok durumu (is_available)
- ✅ Stokta olmayan varyantlar devre dışı
- ✅ Tüm varyantları tükenmiş ürünlerde "TÜKENDİ" rozeti
- ✅ **Ürün sıralama numarası** (display_order) - admin'den belirlenir
- ✅ **Kampanyalı ürün rozeti** - sağ üstte kırmızı rozet

### Admin Paneli
- ✅ Ürün yönetimi (varyantlar dahil)
- ✅ **Ürün sıralama numarası** (1, 2, 3...) 
- ✅ **Kampanyalı ürün işaretleme** ve kampanya yazısı
- ✅ Slider Yönetimi (Video VEYA Resim, PC'den yükleme)
- ✅ Kampanya banner'ları
- ✅ Müşteri yorumları
- ✅ Site logosu
- ✅ IBAN/ödeme bilgileri
- ✅ Üst duyuru çubuğu mesajı
- ✅ Footer içeriği (hakkında, telefon, e-posta)
- ✅ Sipariş yönetimi (makbuz görüntüleme)

### Ödeme Sistemi
- ✅ Site sahibi IBAN bilgileri admin panelinden yönetiliyor
- ✅ Müşteri ödeme makbuzu yüklemeli (resim/PDF)
- ✅ Makbuzlar admin panelinde görüntülenebilir

## Teknik Mimari

### Backend
- FastAPI
- MongoDB (Motor async driver)
- JWT kimlik doğrulama
- Dosya yükleme (/api/upload)

### Frontend
- React
- Tailwind CSS
- Framer Motion (animasyonlar)
- Axios (API çağrıları)

### Veritabanı Şemaları
- **products**: name, description, price, image_url, is_package, variants[], **display_order**, **is_campaign**, **campaign_text**
- **videos (slider)**: title, media_type (video/image), youtube_url, image_url, order, active
- **orders**: order_code (HRB-XXXXXX), customer_details, items, total_amount, status, payment_receipt_url
- **settings**: logo_url, topbar_message, footer_about, footer_phone, footer_email, payment_settings

## Tamamlanan İşler (19 Ocak 2026)
1. ✅ TopBar menünün üstüne taşındı
2. ✅ Slider'a PC'den resim yükleme özelliği
3. ✅ Ürün sıralama numarası (display_order)
4. ✅ Kampanyalı ürün rozeti (is_campaign, campaign_text)
5. ✅ Müşteri için sıralama seçenekleri (fiyat artan/azalan)

## Test Bilgileri
- Admin: admin@herbalife.com / admin123
- Test raporu: /app/test_reports/iteration_2.json

## Kalan Görevler
- Şu an bekleyen görev yok
