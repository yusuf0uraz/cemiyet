import { create } from 'zustand';
import type { CategoryKey } from '../tokens';
import { imageFor } from '../data/mockImages';
import { eventsService, type CreateEventPayload } from '../services/eventsService';
import { useToastStore } from './toastStore';
import { useNotifStore } from './notifStore';
import { useGuestPromptStore } from './guestPromptStore';

export interface FeedEvent {
  id: string;
  cat: CategoryKey;
  title: string;
  club: string;
  clubId: string;
  date: string;
  time: string;
  place: string;
  count: number;
  capacity: number;
  photo: string;
  free: boolean;
  isLive?: boolean;
}

// Seed verisi boş — veriler fetchEvents() ile backend'den gelir
const SEED_EVENTS: FeedEvent[] = [];

// Backend snake_case → frontend camelCase dönüşümü
function mapApiEvent(raw: Record<string, unknown>): FeedEvent {
  return {
    id: raw.id as string,
    cat: (raw.cat as CategoryKey) ?? 'tenis',
    title: raw.title as string,
    club: (raw.club_name ?? raw.club) as string,
    clubId: (raw.club_id ?? raw.clubId ?? '') as string,
    date: raw.date as string,
    time: raw.time as string,
    place: raw.place as string,
    count: Number(raw.count ?? 0),
    capacity: raw.capacity != null ? Number(raw.capacity) : 0,
    photo: (raw.photo as string) ?? imageFor((raw.cat as string) ?? 'tenis'),
    free: Boolean(raw.free ?? true),
    isLive: Boolean(raw.is_live ?? raw.isLive ?? false),
  };
}

interface EventsState {
  events: FeedEvent[];
  bookmarks: string[];
  joinedEvents: string[];
  loading: boolean;
  error: string | null;

  fetchEvents: (params?: { cat?: string }) => Promise<void>;
  fetchBookmarks: () => Promise<void>;
  addEvent: (e: Omit<FeedEvent, 'id'>) => void;
  createEvent: (payload: CreateEventPayload) => Promise<void>;
  toggleBookmark: (eventId: string) => void;
  toggleJoin: (eventId: string) => void;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: SEED_EVENTS,
  bookmarks: [],
  joinedEvents: [],
  loading: false,
  error: null,

  fetchEvents: async (params) => {
    set({ loading: true, error: null });
    try {
      const raw = await eventsService.getEvents(params);
      const events = (raw as unknown as Record<string, unknown>[]).map(mapApiEvent);
      set({ events, loading: false });
    } catch {
      // API erişilemez — seed verisi koru
      set({ loading: false });
    }
  },

  fetchBookmarks: async () => {
    try {
      const raw = await eventsService.getMyBookmarks();
      const ids = (raw as unknown as Record<string, unknown>[]).map(e => e.id as string);
      set({ bookmarks: ids });
    } catch {
      // sessizce geç
    }
  },

  addEvent: (e) => set(s => ({
    events: [{ ...e, id: `ev${Date.now()}` }, ...s.events],
  })),

  createEvent: async (payload) => {
    set({ loading: true, error: null });
    try {
      const raw = await eventsService.createEvent(payload);
      const event = mapApiEvent(raw as unknown as Record<string, unknown>);
      set(s => ({ events: [event, ...s.events], loading: false }));
    } catch {
      // Optimistik ekleme
      get().addEvent({
        cat: payload.cat as CategoryKey,
        title: payload.title,
        club: payload.club_name,
        clubId: payload.club_id ?? '',
        date: payload.date,
        time: payload.time,
        place: payload.place,
        count: 0,
        capacity: payload.capacity ?? 0,
        photo: payload.photo ?? imageFor(payload.cat),
        free: payload.free ?? true,
      });
      set({ loading: false });
    }
  },

  toggleBookmark: (id) => {
    const { useAuthStore } = require('./authStore');
    if (useAuthStore.getState().isGuest) {
      useGuestPromptStore.getState().show('Etkinliği kaydetmek için giriş yapman gerekiyor.');
      return;
    }
    // Optimistik güncelleme
    set(s => ({
      bookmarks: s.bookmarks.includes(id)
        ? s.bookmarks.filter(b => b !== id)
        : [...s.bookmarks, id],
    }));
    // API çağrısı (arka planda)
    eventsService.toggleBookmark(id).catch(() => {
      // Geri al
      set(s => ({
        bookmarks: s.bookmarks.includes(id)
          ? s.bookmarks.filter(b => b !== id)
          : [...s.bookmarks, id],
      }));
    });
  },

  toggleJoin: (id) => {
    // Misafir kontrolü
    const { useAuthStore } = require('./authStore');
    if (useAuthStore.getState().isGuest) {
      useGuestPromptStore.getState().show('Etkinliğe katılmak için giriş yapman gerekiyor.');
      return;
    }
    const isJoined = get().joinedEvents.includes(id);
    const event = get().events.find(e => e.id === id);
    set(s => ({
      joinedEvents: isJoined
        ? s.joinedEvents.filter(j => j !== id)
        : [...s.joinedEvents, id],
      events: s.events.map(e =>
        e.id === id ? { ...e, count: e.count + (isJoined ? -1 : 1) } : e
      ),
    }));
    if (isJoined) {
      useToastStore.getState().show('Etkinlikten ayrıldın', 'info', '👋');
    } else {
      const title = event?.title ? `"${event.title.split('·')[0].trim()}"` : 'Etkinlik';
      useToastStore.getState().show(`${title} etkinliğine katıldın!`, 'success', '🎉');
      useNotifStore.getState().add({
        type: 'event_join',
        actor: event?.club ?? 'Etkinlik',
        tone: '1',
        text: `${title} etkinliğine katıldın! ${event?.date ?? ''} · ${event?.time ?? ''}`.trim(),
        accent: '#E84C2C',
      });
    }
    const call = isJoined
      ? eventsService.leaveEvent(id)
      : eventsService.joinEvent(id);
    call.catch(() => {
      set(s => ({
        joinedEvents: !isJoined
          ? s.joinedEvents.filter(j => j !== id)
          : [...s.joinedEvents, id],
        events: s.events.map(e =>
          e.id === id ? { ...e, count: e.count + (!isJoined ? -1 : 1) } : e
        ),
      }));
    });
  },
}));
