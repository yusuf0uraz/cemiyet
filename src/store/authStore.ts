import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { setAuthToken } from '../services/apiClient';
import { authService } from '../services/authService';

const TOKEN_KEY = 'cemiapp_auth_token';

async function saveToken(token: string) {
  try { await SecureStore.setItemAsync(TOKEN_KEY, token); } catch {}
}
async function loadToken(): Promise<string | null> {
  try { return await SecureStore.getItemAsync(TOKEN_KEY); } catch { return null; }
}
async function deleteToken() {
  try { await SecureStore.deleteItemAsync(TOKEN_KEY); } catch {}
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatarTone: '1' | '2' | '3' | '4' | '5';
  avatarUrl?: string;
  bio: string;
  city: string;
  verified: boolean;
  token?: string;
}

function mapApiUser(raw: Record<string, unknown>): UserProfile {
  return {
    id: raw.id as string,
    name: raw.name as string,
    username: raw.username as string,
    avatarTone: ((raw.avatar_tone ?? raw.avatarTone) as string ?? '1') as UserProfile['avatarTone'],
    avatarUrl: (raw.avatar_url ?? raw.avatarUrl) as string | undefined,
    bio: (raw.bio as string) ?? '',
    city: (raw.city as string) ?? 'Elazığ',
    verified: (raw.verified as boolean) ?? false,
    token: raw.token as string | undefined,
  };
}

interface AuthState {
  isLoggedIn: boolean;
  isGuest: boolean;
  user: UserProfile | null;
  loading: boolean;
  error: string | null;

  continueAsGuest: () => void;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => void;
  restoreSession: () => Promise<void>;

  // SMS doğrulama
  sendCode: (phone: string) => Promise<{ ok: boolean; devCode?: string }>;
  verifyCode: (phone: string, code: string) => Promise<{ isNew: boolean; phone: string }>;

  // Profil oluşturma
  register: (payload: {
    phone: string; name: string; username: string; bio?: string; firebaseUid?: string;
  }) => Promise<void>;

  syncMe: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile & { avatarUrl?: string }>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  isGuest: false,
  user: null,
  loading: false,
  error: null,

  continueAsGuest: () => {
    set({ isGuest: true, isLoggedIn: false, user: null, error: null });
  },

  logout: async () => {
    authService.logout().catch(() => {});
    setAuthToken(null);
    await deleteToken();
    set({ isLoggedIn: false, isGuest: false, user: null, error: null });
  },

  restoreSession: async () => {
    const token = await loadToken();
    if (!token) return;
    setAuthToken(token);
    try {
      const raw = await authService.getMe();
      const user = mapApiUser(raw as unknown as Record<string, unknown>);
      set({ isLoggedIn: true, user: { ...user, token }, error: null });
    } catch {
      deleteToken();
      setAuthToken(null);
    }
  },

  updateUser: (updates) => {
    const u = get().user;
    if (u) set({ user: { ...u, ...updates } });
  },

  sendCode: async (phone) => {
    set({ loading: true, error: null });
    try {
      const res = await authService.sendCode(phone);
      set({ loading: false });
      return { ok: true, devCode: res.code };
    } catch (err: any) {
      const isNetwork = !err?.response;
      const msg = isNetwork
        ? 'Sunucuya bağlanılamadı. Backend çalışıyor mu kontrol et.'
        : (err?.response?.data?.error ?? 'Kod gönderilemedi');
      set({ loading: false, error: msg });
      return { ok: false };
    }
  },

  verifyCode: async (phone, code) => {
    set({ loading: true, error: null });
    try {
      const res = await authService.verify(phone, code);
      if (!res.isNew && res.token && res.user) {
        const user = mapApiUser(res.user as unknown as Record<string, unknown>);
        setAuthToken(res.token);
        saveToken(res.token);
        set({ isLoggedIn: true, user: { ...user, token: res.token }, loading: false });
      } else {
        set({ loading: false });
      }
      return { isNew: res.isNew, phone: res.phone };
    } catch (err: any) {
      const isNetwork = !err?.response;
      const msg = isNetwork
        ? 'Sunucuya bağlanılamadı.'
        : (err?.response?.data?.error ?? 'Kod hatalı veya süresi dolmuş');
      set({ loading: false, error: msg });
      throw new Error(msg);
    }
  },

  register: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await authService.register({
        phone: payload.phone,
        name: payload.name,
        username: payload.username,
        bio: payload.bio,
      });
      const user = mapApiUser(res.user as unknown as Record<string, unknown>);
      setAuthToken(res.token);
      saveToken(res.token);
      set({ isLoggedIn: true, user: { ...user, token: res.token }, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err?.response?.data?.error ?? 'Kayıt başarısız' });
      throw err;
    }
  },

  syncMe: async () => {
    try {
      const raw = await authService.getMe();
      const user = mapApiUser(raw as unknown as Record<string, unknown>);
      set({ user: { ...user, token: get().user?.token } });
    } catch {
      // sessizce görmezden gel
    }
  },

  updateProfile: async (updates) => {
    set({ loading: true, error: null });
    try {
      const payload: Record<string, unknown> = { ...updates };
      if (updates.avatarUrl) payload.avatar_url = updates.avatarUrl;
      const raw = await authService.updateMe(payload as any);
      const user = mapApiUser(raw as unknown as Record<string, unknown>);
      set({ user: { ...user, token: get().user?.token }, loading: false });
    } catch {
      get().updateUser(updates);
      set({ loading: false });
    }
  },
}));
