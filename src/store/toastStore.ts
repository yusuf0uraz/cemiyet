import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  emoji: string;
  show: (message: string, type?: ToastType, emoji?: string) => void;
  hide: () => void;
}

let hideTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: '',
  type: 'success',
  emoji: '✓',

  show: (message, type = 'success', emoji) => {
    if (hideTimer) clearTimeout(hideTimer);
    const defaultEmoji = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    set({ visible: true, message, type, emoji: emoji ?? defaultEmoji });
    hideTimer = setTimeout(() => set({ visible: false }), 2800);
  },

  hide: () => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ visible: false });
  },
}));
