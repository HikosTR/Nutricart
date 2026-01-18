# Herbalife E-Ticaret Sitesi - PRD

## Orijinal Problem Tanımı
Modern, mobil uyumlu, beyaz-yeşil-siyah renk temalı Herbalife ürünleri e-ticaret sitesi.

## Temel Gereksinimler

### Ana Sayfa
- ✅ Slider (Video veya Resim) - admin panelden yönetiliyor
- ✅ Kampanya banner'ı
- ✅ Ürün kartları (spotlight stil)
- ✅ Üst duyuru çubuğu (TopBar) - yeşil, siyah yazılı
- ✅ Dinamik footer

### E-Ticaret Akışı
- ✅ Ürün detay sayfası (varyant seçimi, resim değişimi)
- ✅ Sepet sayfası (ekleme/çıkarma, miktar ayarlama)
- ✅ Ödeme sayfası (Havale/EFT)
- ✅ Sipariş takip sayfası (HRB-XXXXXX kodu ile)

### Ürün Varyantları
- ✅ Her varyantın kendine özel resmi
- ✅ Her varyantın stok durumu (is_available)
- ✅ Stokta olmayan varyantlar devre dışı
- ✅ Tüm varyantları tükenmiş ürünlerde "TÜKENDİ" rozeti

### Admin Paneli
- ✅ Ürün yönetimi (varyantlar dahil)
- ✅ **Slider Yönetimi** (Video VEYA Resim seçeneği) ← YENİ
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
- **products**: name, description, price, image_url, is_package, variants[{name, image_url, is_available, stock}]
- **videos (slider)**: title, media_type (video/image), youtube_url, image_url, order, active
- **orders**: order_code (HRB-XXXXXX), customer_details, items, total_amount, status, payment_receipt_url
- **settings**: logo_url, topbar_message, footer_about, footer_phone, footer_email, payment_settings

## Tamamlanan İşler (18 Ocak 2026)
1. ✅ TopBar menünün üstüne taşındı (z-50, fixed positioning)
2. ✅ Tüm sayfalarda TopBar + Navbar düzeni uygulandı
3. ✅ Dinamik footer içeriği admin panelinden yönetiliyor
4. ✅ Stokta olmayan varyant sistemi çalışıyor
5. ✅ **Slider Yönetimi** - Video veya Resim seçeneği eklendi
6. ✅ Ana sayfada hem video hem resim slider desteği

## Test Bilgileri
- Admin: admin@herbalife.com / admin123
- Test raporu: /app/test_reports/iteration_2.json
- API testleri: /app/tests/test_herbalife_api.py

## Kalan Görevler
- Şu an bekleyen görev yok

## Gelecek İyileştirmeler (Öneriler)
- Sipariş e-posta bildirimleri
- Stok azaldığında admin uyarısı
- Müşteri kayıt/giriş sistemi
- Favori ürünler
