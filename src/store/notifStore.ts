import { create } from 'zustand';

export type NotifType =
  | 'event_join' | 'event_reminder'
  | 'club_join' | 'club_announcement'
  | 'follow' | 'badge' | 'reaction';

export interface NotifItem {
  id: string;
  type: NotifType;
  actor: string;
  tone: '1' | '2' | '3' | '4' | '5';
  text: string;
  time: string; // ISO
  isRead: boolean;
  accent: string;
}

interface NotifState {
  items: NotifItem[];
  add: (n: Omit<NotifItem, 'id' | 'time' | 'isRead'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const ACCENTS: Record<NotifType, string> = {
  event_join:        '#E84C2C',
  event_reminder:    '#E84C2C',
  club_join:         '#2E8B57',
  club_announcement: '#6B655C',
  follow:            '#2E7DD8',
  badge:             '#D49B2E',
  reaction:          '#7B4FA0',
};

export const useNotifStore = create<NotifState>((set) => ({
  items: [],

  add: (n) => set(s => ({
    items: [
      {
        ...n,
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        time: new Date().toISOString(),
        isRead: false,
        accent: ACCENTS[n.type],
      },
      ...s.items,
    ].slice(0, 50), // max 50
  })),

  markRead: (id) => set(s => ({
    items: s.items.map(n => n.id === id ? { ...n, isRead: true } : n),
  })),

  markAllRead: () => set(s => ({
    items: s.items.map(n => ({ ...n, isRead: true })),
  })),
}));
