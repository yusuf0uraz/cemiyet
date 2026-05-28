# CemiApp — Kullanım Senaryoları ve Test Durumu

> Legend: ✅ Çalışıyor | ⚠️ Kısmen | ❌ Eksik/Kırık | 🔧 Yapım aşamasında

---

## 1. KULLANICI KAYIT & GİRİŞ

### 1.1 Yeni kullanıcı kaydı
**Akış:** Splash → Register → SmsVerify → ProfileCreate → Interests → Ana ekran

| Adım | Durum | Notlar |
|------|-------|--------|
| Splash ekranı açılır | ✅ | |
| Telefon numarası girilir | ✅ | +90 prefix ile |
| KVKK onayı işaretlenir | ✅ | |
| SMS kodu gönderilir | ✅ | Dev modda kod: `123456` |
| 6 haneli kod girilir | ✅ | Otomatik verify |
| İsim/kullanıcı adı girilir | ✅ | Username kontrolü yapılıyor |
| İlgi alanları seçilir (min 3) | ✅ | Backend'e kaydediliyor |
| Ana ekrana yönlendirme | ✅ | |

### 1.2 Mevcut kullanıcı girişi
| Adım | Durum | Notlar |
|------|-------|--------|
| Aynı telefon numarasıyla giriş | ✅ | `isNew: false` döner |
| Direkt ana ekrana geçiş | ✅ | JWT token kaydedilir |

### 1.3 Misafir modu
| Adım | Durum | Notlar |
|------|-------|--------|
| "Misafir olarak keşfet" | ✅ | Sınırlı özellikler |
| Üye gereken işlemlerde uyarı | ✅ | GuestPromptModal |

### 1.4 Çıkış yapma
| Adım | Durum | Notlar |
|------|-------|--------|
| MyProfile → sağ üst ↩ butonu | ✅ | Alert onay dialogu |
| PrivacySettings → "Çıkış Yap" | ✅ | Alert onay dialogu |
| Token temizleme + state sıfırlama | ✅ | SecureStore'dan siliniyor |

---

## 2. ETKİNLİKLER

### 2.1 Etkinlik listeleme
| Adım | Durum | Notlar |
|------|-------|--------|
| Home ekranında etkinlik feed | ✅ | Backend'den çekiliyor |
| Kategori filtresi | ✅ | Tenis, Futbol, Workshop vb. |
| Canlı etkinlikler önce | ✅ | `is_live` sıralaması |
| Trend / En Yeni filtresi | ✅ | |

### 2.2 Etkinlik detayı
| Adım | Durum | Notlar |
|------|-------|--------|
| EventDetail ekranı açılır | ✅ | Store'dan veya API'den yüklenir |
| Geri sayım (canlı değilse) | ✅ | Gerçek zamanlı |
| Yer imi ekleme | ✅ | Backend'e kaydediliyor |
| Katılma / Ayrılma | ✅ | Optimistik güncelleme |
| Cemiyet profiline git | ✅ | |

### 2.3 Etkinlik oluşturma ⚠️
| Adım | Durum | Notlar |
|------|-------|--------|
| Yalnızca cemiyet yöneticisi oluşturabilir | ✅ | Backend + frontend kontrol |
| Kategori seçimi (22 kategori) | ✅ | Workshop, Turnuva, GameJam dahil |
| Başlık, açıklama, tarih, saat, konum | ✅ | |
| Kapasite girişi | ✅ | İsteğe bağlı |
| Kapak fotoğrafı (R2 upload) | ✅ | |
| Hiç cemiyeti yoksa oluşturamaz | ⚠️ | UI uyarısı eksik |

### 2.4 Canlı etkinlik / Check-in
| Adım | Durum | Notlar |
|------|-------|--------|
| Canlı fotoğraf paylaşımı | ✅ | Kamera/galeri + R2 upload |
| Yorum gönderme | ✅ | Klavye sorunsuz |
| Kalp / Alev reaksiyonları | ✅ | |
| Fotoğraf akışı | ⚠️ | Demo görseller + gerçek upload |

---

## 3. CEMİYETLER

### 3.1 Cemiyet listeleme
| Adım | Durum | Notlar |
|------|-------|--------|
| Cemiyetler ekranı | ✅ | Backend'den çekiliyor |
| Kategori filtresi | ✅ | |
| Üyelik durumu gösterimi | ✅ | Üye / Bekliyor / Katıl |

### 3.2 Cemiyet profili
| Adım | Durum | Notlar |
|------|-------|--------|
| Üyeler listesi | ✅ | API'den çekiliyor |
| Etkinlikler listesi | ✅ | Club_id ile filtreleniyor |
| Duvar gönderileri | ✅ | ClubWall ekranı |
| Cemiyet görsellerini R2'ye yükleme | ✅ | |

### 3.3 Cemiyete katılma
| Adım | Durum | Notlar |
|------|-------|--------|
| Açık cemiyet — direkt katılım | ✅ | |
| Onaylı cemiyet — başvuru | ✅ | Yönetici onayı gerekiyor |
| Kapalı cemiyet — davet gerekli | ✅ | Engel mesajı |
| Cemiyetten ayrılma | ✅ | Reis ayrılamaz |

### 3.4 Cemiyet kurma
| Adım | Durum | Notlar |
|------|-------|--------|
| İsim, kategori, açıklama | ✅ | |
| Üyelik modeli (Açık/Onaylı/Kapalı) | ✅ | Backend'e gönderiliyor |
| Kapak fotoğrafı (R2) | ✅ | |
| Kurucu otomatik 'reis' olur | ✅ | |

### 3.5 Üye yönetimi
| Adım | Durum | Notlar |
|------|-------|--------|
| Bekleyen başvurular | ✅ | MemberManage ekranı |
| Başvuru onayla/reddet | ✅ | API bağlı |
| Üye rolleri görüntüleme | ✅ | |

### 3.6 Duvar
| Adım | Durum | Notlar |
|------|-------|--------|
| Gönderi oluşturma | ✅ | |
| Duyuru (sadece yönetici) | ✅ | |
| Reaksiyon verme | ✅ | bravo/geliyorum/süper/tebrik |
| Yazara profil linki | ✅ | OtherProfile navigasyonu |

---

## 4. PROFİL

### 4.1 Kendi profil
| Adım | Durum | Notlar |
|------|-------|--------|
| Profil bilgileri gösterimi | ✅ | API'den güncel veri |
| Avatar görüntüleme | ✅ | avatarUrl varsa R2'den |
| Katıldığı cemiyetler | ✅ | |
| Etkinlik istatistikleri | ✅ | |
| Rozetler | ✅ | (demo verisi) |

### 4.2 Profil düzenleme
| Adım | Durum | Notlar |
|------|-------|--------|
| İsim, kullanıcı adı, biyografi | ✅ | |
| Fotoğraf değiştirme (R2 upload) | ✅ | |
| Username müsaitlik kontrolü | ✅ | Debounce ile |

### 4.3 Başkasının profili
| Adım | Durum | Notlar |
|------|-------|--------|
| Kullanıcı bilgileri | ✅ | API'den çekiliyor |
| Takip et / Takibi bırak | ✅ | Backend bağlı |
| Ortak cemiyetler | ✅ | |

---

## 5. HARITA

| Adım | Durum | Notlar |
|------|-------|--------|
| Harita görünümü | ✅ | Expo Go'da çalışır |
| Elazığ merkezi pin'ler | ✅ | 8 konum |
| Kategori filtresi | ✅ | |
| Seçili konumun etkinlikleri | ✅ | Kategori eşleştirmesi |
| Google Maps API key | ❌ | Production build için gerekli |
| Kullanıcı konumu | ⚠️ | İzin alınıyor, kullanılıyor |

**Google Maps API key almak için:**
1. console.cloud.google.com → Proje → Maps SDK for Android/iOS
2. API key oluştur
3. `app.json` → android.config.googleMaps.apiKey ve ios.config.googleMapsApiKey alanlarına ekle

---

## 6. ARAMA

| Adım | Durum | Notlar |
|------|-------|--------|
| Metin araması | ✅ | Store + API (debounce 350ms) |
| Etkinlik sonuçları | ✅ | Başlık, yer, cemiyet adı |
| Cemiyet sonuçları | ✅ | İsim, açıklama |
| Kategori filtresi | ✅ | |
| Yükleniyor göstergesi | ✅ | ActivityIndicator |

---

## 7. BİLDİRİMLER

| Adım | Durum | Notlar |
|------|-------|--------|
| Etkinlik katılım bildirimi | ✅ | Store'a ekleniyor |
| Cemiyet katılım bildirimi | ✅ | Store'a ekleniyor |
| Bildirimden etkinliğe git | ✅ | EntityId ile navigate |
| Geri takip et | ⚠️ | actorId gerekiyor |
| Backend push notification | ❌ | Firebase Messaging kurulmadı |

---

## 8. GİZLİLİK AYARLARI

| Adım | Durum | Notlar |
|------|-------|--------|
| Profil modu (Herkese/Yarı/Gizli) | ✅ | (UI only, backend yok) |
| Görünürlük toggle'ları | ✅ | (UI only) |
| KVKK metni | ✅ | (link gösterimi) |
| Çıkış yap | ✅ | Alert onaylı |

---

## 9. MESAJLAŞMA

| Adım | Durum | Notlar |
|------|-------|--------|
| DM / Direkt mesaj | ❌ | Planlandı |
| Grup mesajı | ❌ | Planlandı |

---

## 10. EKSIK / YAPILACAKLAR

| Özellik | Durum | Açıklama |
|---------|-------|----------|
| Google Maps API key | ❌ | Production'da harita için gerekli |
| Backend push notification | ❌ | Firebase Cloud Messaging |
| Hesap silme | ❌ | Backend endpoint yok |
| Telefon numarası değiştirme | ❌ | |
| Mesajlaşma sistemi | ❌ | DM altyapısı yok |
| Kullanıcı engelleme | ❌ | |
| İçerik raporlama | ❌ | |
| Event arşiv galerisi | ⚠️ | Demo görseller |
| Profil kategorileri API | ⚠️ | Şu an seed verisi |

---

## HIZLI TEST REHBERİ

### Backend'i başlat:
```bash
cd backend && npm run dev
```
> Dev modda SMS kodu: `123456`

### Uygulamayı başlat:
```bash
npx expo start --clear
```

### Temel test akışı:
1. Splash → "Hemen başla"
2. Telefon: `5551234567` → Kod gönder
3. Kod: `123456`
4. İsim: `Test Kullanıcı`, kullanıcı adı: `test.user`
5. 3+ ilgi alanı seç → "CemiApp'e gir"
6. Ana ekranda etkinlikleri gör
7. Cemiyetler → İlk cemiyete katıl
8. Cemiyet oluşturduktan sonra etkinlik oluştur
