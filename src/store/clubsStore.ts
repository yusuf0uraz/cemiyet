import { create } from 'zustand';
import type { CategoryKey } from '../tokens';
import { imageFor } from '../data/mockImages';
import { clubsService, type CreateClubPayload } from '../services/clubsService';
import { useToastStore } from './toastStore';
import { useNotifStore } from './notifStore';
import { useGuestPromptStore } from './guestPromptStore';

export interface ClubItem {
  id: string;
  name: string;
  cat: CategoryKey;
  photo: string;
  memberCount: number;
  myRole: 'reis' | 'yardimci' | 'aza' | null;
  joinStatus?: 'uye' | 'bekliyor' | null;
  membershipModel?: 'acik' | 'onay' | 'kapali';
  unread?: number;
  nextEvent?: string;
  description?: string;
}

// Seed verisi — sadece API yüklenene kadar görüntü olarak kullanılır.
// ID'ler kasıtlı olarak boş bırakıldı; gerçek UUID'ler fetchClubs() ile gelir.
const SEED_CLUBS: ClubItem[] = [];

// Backend snake_case → ClubItem dönüşümü
function mapApiClub(raw: Record<string, unknown>, myRole: ClubItem['myRole'] = null): ClubItem {
  return {
    id: raw.id as string,
    name: raw.name as string,
    cat: (raw.cat as CategoryKey) ?? 'tenis',
    photo: (raw.photo as string) ?? imageFor((raw.cat as string) ?? 'tenis'),
    memberCount: Number(raw.member_count ?? raw.memberCount ?? 0),
    myRole,
    membershipModel: (raw.membership_model as ClubItem['membershipModel']) ?? 'acik',
    description: raw.description as string | undefined,
  };
}

interface ClubsState {
  clubs: ClubItem[];
  loading: boolean;
  error: string | null;

  fetchClubs: () => Promise<void>;
  addClub: (club: Omit<ClubItem, 'id'>) => void;
  createClub: (payload: CreateClubPayload) => Promise<void>;
  joinClub: (clubId: string, applicationNote?: string) => void;
  leaveClub: (clubId: string) => void;
}

export const useClubsStore = create<ClubsState>((set, get) => ({
  clubs: SEED_CLUBS,
  loading: false,
  error: null,

  fetchClubs: async () => {
    set({ loading: true, error: null });
    try {
      const raw = await clubsService.getClubs();
      const clubs = (raw as unknown as Record<string, unknown>[]).map(c => mapApiClub(c));
      set({ clubs, loading: false });
    } catch (err: any) {
      if (__DEV__) console.warn('[Clubs] fetchClubs hata:', err?.message);
      set({ loading: false });
    }
  },

  addClub: (club) => set(s => ({
    clubs: [{ ...club, id: `club-${Date.now()}` }, ...s.clubs],
  })),

  createClub: async (payload) => {
    set({ loading: true, error: null });
    try {
      const raw = await clubsService.createClub(payload);
      const club = mapApiClub(raw as unknown as Record<string, unknown>, 'reis');
      set(s => ({ clubs: [club, ...s.clubs], loading: false }));
    } catch (err: any) {
      if (__DEV__) console.warn('[Clubs] createClub hata:', err?.message);
      get().addClub({
        name: payload.name,
        cat: payload.cat as CategoryKey,
        photo: payload.photo ?? imageFor(payload.cat),
        memberCount: 1,
        myRole: 'reis',
        membershipModel: (payload as any).membership_model ?? 'acik',
        description: payload.description,
      });
      set({ loading: false });
    }
  },

  joinClub: async (id, applicationNote) => {
    // Misafir kontrolü
    const { useAuthStore } = require('./authStore');
    if (useAuthStore.getState().isGuest) {
      useGuestPromptStore.getState().show('Cemiyete katılmak için giriş yapman gerekiyor.');
      return;
    }
    const club = get().clubs.find(c => c.id === id);
    const model = club?.membershipModel ?? 'acik';

    if (model === 'kapali') {
      useToastStore.getState().show('Bu cemiyet sadece davet ile katılıma açıktır', 'error', '🔒');
      return;
    }

    try {
      const res = await clubsService.joinClub(id, applicationNote) as { joined: boolean; status?: string; message?: string };

      if (res.status === 'bekliyor') {
        // Onay bekliyor
        set(s => ({
          clubs: s.clubs.map(c =>
            c.id === id ? { ...c, joinStatus: 'bekliyor' } : c
          ),
        }));
        useToastStore.getState().show(res.message ?? 'Başvurunuz alındı. Onay bekleniyor.', 'info', '⏳');
        useNotifStore.getState().add({
          type: 'club_join',
          actor: club?.name ?? 'Cemiyet',
          tone: '2',
          text: `"${club?.name}" cemiyetine başvurun alındı. Onay bekleniyor.`,
          accent: '#D49B2E',
        });
      } else if (res.joined) {
        // Doğrudan üye oldu
        set(s => ({
          clubs: s.clubs.map(c =>
            c.id === id ? { ...c, myRole: 'aza', joinStatus: 'uye', memberCount: c.memberCount + 1 } : c
          ),
        }));
        useToastStore.getState().show(`"${club?.name ?? 'Cemiyet'}" cemiyetine katıldın!`, 'success', '🏅');
        useNotifStore.getState().add({
          type: 'club_join',
          actor: club?.name ?? 'Cemiyet',
          tone: '2',
          text: `"${club?.name ?? 'Cemiyet'}" cemiyetine katıldın. Merhaba!`,
          accent: '#2E8B57',
        });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Katılım başarısız';
      useToastStore.getState().show(msg, 'error', '✕');
    }
  },

  leaveClub: (id) => {
    set(s => ({
      clubs: s.clubs.map(c =>
        c.id === id ? { ...c, myRole: null, memberCount: Math.max(0, c.memberCount - 1) } : c
      ),
    }));
    useToastStore.getState().show('Cemiyetten ayrıldın', 'info', '👋');
    clubsService.leaveClub(id).catch(() => {
      set(s => ({
        clubs: s.clubs.map(c =>
          c.id === id ? { ...c, myRole: 'aza', memberCount: c.memberCount + 1 } : c
        ),
      }));
    });
  },
}));
