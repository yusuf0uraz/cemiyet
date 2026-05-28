import { create } from 'zustand';

interface GuestPromptState {
  visible: boolean;
  message: string;
  show: (message?: string) => void;
  hide: () => void;
}

export const useGuestPromptStore = create<GuestPromptState>((set) => ({
  visible: false,
  message: 'Bu özelliği kullanmak için giriş yapman gerekiyor.',
  show: (message) => set({
    visible: true,
    message: message ?? 'Bu özelliği kullanmak için giriş yapman gerekiyor.',
  }),
  hide: () => set({ visible: false }),
}));
