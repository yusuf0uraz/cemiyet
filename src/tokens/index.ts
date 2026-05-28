// CemiApp · Tasarım Tokenları v2

import { Platform } from 'react-native';

// ─── Renkler ────────────────────────────────────────────────
export const colors = {
  // Arka plan
  bg: '#F7F1E3',
  bg2: '#F1E9D3',

  // Yüzey
  surface: '#FFFFFF',
  surface2: '#FBF6EA',
  surface3: '#EFE6CF',

  // Primary — ember (ateş)
  ember: '#E84C2C',
  emberDeep: '#B83A20',
  emberSoft: '#FA6A4A',
  emberGlow: '#FF8866',

  // İkincil
  amber: '#D49B2E',
  amberLight: '#F2C76A',
  forest: '#2E8B57',
  grape: '#7A4DD8',
  ocean: '#2E7DD8',
  sand: '#C9A86B',

  // Mürekkep & taş
  ink: '#1A1814',
  ink2: '#2D2823',
  stone: '#6B655C',
  stone2: '#A39B8E',
  stone3: '#D4CCBC',

  // Çizgiler
  rule: 'rgba(26,24,20,0.10)',
  ruleSoft: 'rgba(26,24,20,0.06)',
  ruleStrong: 'rgba(26,24,20,0.18)',

  // Karanlık mod
  night: '#14110E',
  night2: '#1F1B16',

  // Placeholder gradient tonları
  placeholder1: { start: '#FF8866', end: '#B83A20' },  // ember
  placeholder2: { start: '#2E8B57', end: '#1F5F40' },  // forest
  placeholder3: { start: '#F2C76A', end: '#D49B2E' },  // amber
  placeholder4: { start: '#7A4DD8', end: '#4A2B85' },  // grape
  placeholder5: { start: '#2E7DD8', end: '#1F5FAC' },  // ocean
} as const;

// ─── Tipografi ───────────────────────────────────────────────
export const fonts = {
  sans: Platform.select({ ios: 'Manrope', android: 'Manrope', default: 'Manrope' }),
  mono: Platform.select({ ios: 'JetBrainsMono', android: 'JetBrainsMono', default: 'JetBrainsMono' }),
} as const;

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
} as const;

export const fontSizes = {
  xs: 9,
  sm: 10,
  base: 11,
  md: 12,
  lg: 13,
  xl: 14,
  '2xl': 15,
  '3xl': 16,
  '4xl': 17,
  '5xl': 18,
  '6xl': 20,
  '7xl': 22,
  '8xl': 24,
  '9xl': 26,
  '10xl': 28,
  display: 32,
  displayLg: 36,
  hero: 56,
} as const;

export const letterSpacing = {
  tight: -0.5,
  tighter: -0.8,
  normal: 0,
  wide: 0.5,
  wider: 1.5,
  widest: 2,
} as const;

// ─── Köşe Radyüsü ───────────────────────────────────────────
export const r = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 9999,
  full: 9999,
} as const;

// ─── Boşluk (Spacing) ───────────────────────────────────────
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 10,
  4: 12,
  5: 14,
  6: 16,
  7: 18,
  8: 20,
  9: 22,
  10: 24,
  12: 28,
  14: 32,
  16: 36,
  20: 44,
} as const;

// ─── Gölgeler ────────────────────────────────────────────────
export const sh = {
  sm: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
  },
  lg: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 12,
  },
  ember: {
    shadowColor: colors.ember,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;

// ─── Kategori Tanımları ───────────────────────────────────────
export const categories = {
  // Spor
  tenis:     { color: '#E84C2C', label: 'Tenis' },
  futbol:    { color: '#2E8B57', label: 'Futbol' },
  bisiklet:  { color: '#2E7DD8', label: 'Bisiklet' },
  yuruyus:   { color: '#5A9143', label: 'Yürüyüş' },
  bilardo:   { color: '#2B6CB0', label: 'Bilardo' },
  // Kültür & Sanat
  kitap:     { color: '#D49B2E', label: 'Kitap' },
  sinema:    { color: '#7A4DD8', label: 'Sinema' },
  muzik:     { color: '#C0399E', label: 'Müzik' },
  foto:      { color: '#6B655C', label: 'Fotoğraf' },
  dans:      { color: '#E8448C', label: 'Dans' },
  // Sosyal
  kahve:     { color: '#8B5E2E', label: 'Kahve' },
  yemek:     { color: '#E5963C', label: 'Yemek' },
  doga:      { color: '#2E8B57', label: 'Doğa' },
  // Eğitim & Oyun
  atolye:    { color: '#D4622E', label: 'Atölye' },
  oyun:      { color: '#1F8A5B', label: 'Oyun' },
  satranc:   { color: '#4A4A4A', label: 'Satranç' },
  tavla:     { color: '#8B4513', label: 'Tavla' },
  // Etkinlik Türleri
  workshop:  { color: '#0D7BBF', label: 'Workshop' },
  turnuva:   { color: '#B7410E', label: 'Turnuva' },
  gameJam:   { color: '#6A0DAD', label: 'Game Jam' },
  hackathon: { color: '#1A7A4A', label: 'Hackathon' },
  konser:    { color: '#C0399E', label: 'Konser' },
  sergi:     { color: '#A0522D', label: 'Sergi' },
} as const;

export type CategoryKey = keyof typeof categories;

// ─── Rozet Tanımları ─────────────────────────────────────────
export const badges = {
  ilkAdim:    { tier: 1, name: 'İlk Adım',     desc: 'İlk etkinliğini tamamladın',       req: 1,   color: '#2E7DD8' },
  cirak:      { tier: 1, name: 'Çırak',        desc: '5 etkinlik tamamlandı',            req: 5,   color: '#2E8B57' },
  kalfa:      { tier: 2, name: 'Kalfa',        desc: '20 etkinlik tamamlandı',           req: 20,  color: '#D49B2E' },
  usta:       { tier: 3, name: 'Usta',         desc: '50 etkinlik tamamlandı',           req: 50,  color: '#E84C2C' },
  ustad:      { tier: 4, name: 'Üstad',        desc: '100 etkinlik tamamlandı',          req: 100, color: '#7A4DD8' },
  sabahci:    { tier: 2, name: 'Sabahçı',      desc: '10 sabah etkinliği (06-09 arası)', req: 10,  color: '#E5963C' },
  yedi:       { tier: 1, name: 'Yedi Sefer',   desc: '7 etkinliğe katıldın',             req: 7,   color: '#D49B2E' },
  yagmur:     { tier: 2, name: 'Yağmur',       desc: 'Yağmurlu bir etkinlikte çıktın',   req: 1,   color: '#2E7DD8' },
  hazar:      { tier: 2, name: 'Hazar',        desc: 'Hazar bölgesinde 5 etkinlik',      req: 5,   color: '#5A9143' },
  kitapKurdu: { tier: 3, name: 'Kitap Kurdu',  desc: '15 kitap etkinliği',               req: 15,  color: '#D49B2E' },
  davetci:    { tier: 2, name: 'Davetçi',      desc: '10 kişiyi davet ettin',            req: 10,  color: '#2E7DD8' },
  kurucu:     { tier: 3, name: 'Kurucu',       desc: 'Bir cemiyet kurdun',               req: 1,   color: '#E84C2C' },
  kokluUye:   { tier: 4, name: 'Köklü Üye',    desc: "365 gündür CemiApp'tesin",         req: 365, color: '#6B655C' },
  disiplin:   { tier: 3, name: 'Disiplinli',   desc: '12 hafta üst üste aktif',          req: 12,  color: '#E84C2C' },
} as const;

export const tierLabels: Record<number, string> = {
  1: 'BRONZ',
  2: 'GÜMÜŞ',
  3: 'ALTIN',
  4: 'PLATİN',
};

// ─── Tepki (Reaction) Tanımları ───────────────────────────────
export const reactions = {
  bravo:     { label: 'Bravo',     color: '#E84C2C' },
  geliyorum: { label: 'Geliyorum', color: '#2E7DD8' },
  super:     { label: 'Süper',     color: '#D49B2E' },
  tebrik:    { label: 'Tebrik',    color: '#7A4DD8' },
} as const;

export type ReactionKey = keyof typeof reactions;

// ─── Tab Bar ──────────────────────────────────────────────────
export const tabBar = {
  height: 88,
  iconSize: 22,
} as const;

// ─── Mobil Boyutlar ───────────────────────────────────────────
export const layout = {
  screenPaddingH: 20,
  screenPaddingV: 14,
  cardPadding: 14,
  headerHeight: 52,
  tabBarHeight: 88,
  statusBarHeight: 44,
  bottomSafeArea: 34,
} as const;

// Default export (tüm tokenlar bir arada)
const tokens = { colors, fonts, fontWeights, fontSizes, letterSpacing, r, spacing, sh, categories, badges, tierLabels, reactions, tabBar, layout };
export default tokens;
