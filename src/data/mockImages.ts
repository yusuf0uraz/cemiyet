// Gerçek fotoğraflar — Unsplash curated
export const MOCK_IMAGES: Record<string, string> = {
  tenis:    'https://images.unsplash.com/photo-1562184552-997c461abbe6?w=800&auto=format&fit=crop',
  yuruyus:  'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop',
  kitap:    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format&fit=crop',
  muzik:    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop',
  foto:     'https://images.unsplash.com/photo-1500051638674-ff996a0ec29e?w=800&auto=format&fit=crop',
  yemek:    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop',
  oyun:     'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&auto=format&fit=crop',
  atolye:   'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&auto=format&fit=crop',
  bisiklet: 'https://images.unsplash.com/photo-1530143584546-02191bc84eb5?w=800&auto=format&fit=crop',
  satranc:  'https://images.unsplash.com/photo-1582425831055-6a3e1b09ac11?w=800&auto=format&fit=crop',
  kos:      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop',
  dans:     'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop',
  hazar:    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
  harput:   'https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&auto=format&fit=crop',
  dogadans: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
};

export function imageFor(cat: string): string {
  return MOCK_IMAGES[cat] ?? MOCK_IMAGES.hazar;
}
