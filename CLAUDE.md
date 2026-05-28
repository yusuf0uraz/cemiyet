# CemiApp · Claude Kurallar Dosyası

## Proje Genel Bakış
CemiApp, Elazığ merkezli bir topluluk etkinlik uygulamasıdır. Kullanıcılar etkinlik keşfeder, cemiyet (kulüp) kurar ve anlık paylaşım yapar.

**Slogan:** "Şehrindeki her şey, cebinde."
**Teknoloji:** React Native + Expo (TypeScript)
**Min SDK:** Android 6 / iOS 14

---

## Proje Yapısı

```
src/
  components/     # Paylaşılan bileşenler (Button, Avatar, Chip, vb.)
  screens/        # Ekran bileşenleri (auth/, home/, event/, club/, profile/)
  navigation/     # Stack ve Tab navigasyon tanımları
  tokens/         # Tasarım tokenları (renkler, tipografi, spacing, vb.)
  hooks/          # Custom React hook'lar
  utils/          # Yardımcı fonksiyonlar
  types/          # TypeScript tip tanımları
  assets/         # Fontlar, görseller, ikonlar
```

---

## Tasarım Sistemi Kuralları

### Token Kullanımı
- **DAIMA** `src/tokens/index.ts` dosyasından token'ları import et
- Hard-coded renk, font boyutu veya spacing değeri kullanma
- Örnek: `colors.ember` kullan, `'#E84C2C'` YAZMA

### Renkler
- Ana vurgu: `colors.ember` (#E84C2C) — CTA butonlar, aktif sekmeler
- Arka plan: `colors.bg` (#F7F1E3) — sıcak krem zemin
- Yüzey: `colors.surface` (#FFFFFF) — kartlar
- Mürekkep: `colors.ink` (#1A1814) — ana metin
- Taş: `colors.stone` (#6B655C) — ikincil metin

### Tipografi
- **Başlık/Gövde:** Manrope (fontWeight 800/700/600/500)
- **Mono/Meta:** JetBrains Mono (fontWeight 400/500)
- Serif kullanma (Cormorant Garamond yalnızca brand/landing sayfası için)
- Letter spacing başlıklarda: `-0.03em` ile `-0.04em`

### Bileşen Standartları
- Butonlar: `btn-ember` (ana CTA), `btn-ghost` (ikincil), `btn-dark` (koyu)
- Tüm butonlar `borderRadius: tokens.r.pill` (9999) kullanır
- Chip/Etiket: `borderRadius: tokens.r.pill`
- Kart: `borderRadius: tokens.r.md` (14) veya `tokens.r.lg` (20)
- İkon boyutu: 20x20 (standart), 16x16 (küçük), 24x24 (büyük)

### Gölgeler
- sm: `sh.sm` — ince, çok hafif
- md: `sh.md` — standart kart gölgesi
- lg: `sh.lg` — yüzen eleman gölgesi
- ember: `sh.ember` — ember rengi buton için özel

---

## Navigasyon Yapısı

```
RootStack
├── Auth Flow (Stack)
│   ├── Splash
│   ├── Register
│   ├── SmsVerify
│   ├── ProfileCreate
│   └── Interests
└── Main (Bottom Tab)
    ├── Home Tab
    │   ├── HomeScreen
    │   └── Notifications
    ├── Discover Tab
    │   ├── DiscoverScreen
    │   ├── MapView
    │   └── Search
    ├── Create (Modal)
    │   ├── EventCreate
    │   └── ClubCreate
    ├── Clubs Tab
    │   ├── ClubsScreen
    │   ├── ClubProfile
    │   ├── ClubWall
    │   └── MemberManage
    └── Me Tab
        ├── MyProfile
        ├── OtherProfile
        └── PrivacySettings

EventDetail, EventArchive, CheckIn → Modal Stack üzerinden
```

---

## Kod Standartları

### TypeScript
- Strict mode aktif (`tsconfig.json`)
- Her bileşen için `Props` tipi tanımla
- `any` kullanma, bilinmeyen tipler için `unknown`

### Bileşen Yazımı
- Fonksiyonel bileşen kullan (class component yok)
- StyleSheet.create() ile stiller tanımla (inline style yalnızca dinamik değerler için)
- Props destructuring'ı bileşen imzasında yap

### İsimlendirme
- Bileşenler: PascalCase (`EventCard`, `StoryRing`)
- Hooklar: camelCase + `use` prefix (`useAuth`, `useEvents`)
- Sabitler/tokenlar: camelCase (`colors.ember`, `spacing.md`)
- Screen dosyaları: PascalCase + Screen suffix (`HomeScreen.tsx`)

### Performans
- Listeler için `FlatList` veya `FlashList` kullan (`.map()` KULLANMA)
- `useCallback` ve `useMemo` uygun yerlerde kullan
- Görsel placeholder'lar için `warm-placeholder` token renklerini gradient olarak kullan

---

## Ekran Listesi (26 Ekran)

### Auth (01–05)
- 01 Splash
- 02 Register (telefon)
- 03 SmsVerify
- 04 ProfileCreate
- 05 Interests

### Ana / Keşfet (06–09)
- 06 Home (stories + feed)
- 07 Discover (kategoriler)
- 08 MapView (kategori ikonlu pinler)
- 09 Search & Filter

### Etkinlik (10–13)
- 10 EventDetail
- 11 EventCreate
- 12 CheckIn (CANLI mod)
- 13 EventArchive

### Cemiyet (14–17)
- 14 ClubProfile
- 15 ClubCreate
- 16 MemberManage
- 17 ClubWall

### Profil & Ayarlar (18–21)
- 18 MyProfile
- 19 OtherProfile
- 20 Notifications
- 21 PrivacySettings

---

## Lokalizasyon
- Uygulama dili: **Türkçe**
- Tarih formatı: `DD Ay · Gün` (24 May · Cmt)
- Saat formatı: 24 saat (18:00)
- Para birimi: TL (₺)

## Bölge
- Elazığ, Türkiye
- Referans mekânlar: Hazar Gölü, Fırat Üniversitesi, Harput

---

## Git Commit Kuralları
- feat: yeni ekran veya özellik
- fix: hata düzeltme
- style: stil değişiklikleri
- refactor: yeniden yapılandırma
- chore: bağımlılık güncellemeleri
