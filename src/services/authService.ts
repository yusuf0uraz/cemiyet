import { apiClient, setAuthToken } from './apiClient';
import { ENDPOINTS } from '../config/api';
import type { UserProfile } from '../store/authStore';

export interface SendCodeResponse {
  message: string;
  code?: string; // sadece development modda döner
}

export interface VerifyResponse {
  token: string | null;
  user: UserProfile | null;
  phone: string;
  isNew: boolean;
}

export interface RegisterPayload {
  phone: string;
  name: string;
  username: string;
  bio?: string;
  city?: string;
  firebaseUid?: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export const authService = {
  // ── SMS doğrulama ──────────────────────────────────────────────────────
  async sendCode(phone: string): Promise<SendCodeResponse> {
    const { data } = await apiClient.post<SendCodeResponse>(ENDPOINTS.auth.sendCode, { phone });
    return data;
  },

  async verify(phone: string, code: string): Promise<VerifyResponse> {
    const { data } = await apiClient.post<VerifyResponse>(ENDPOINTS.auth.verify, { phone, code });
    if (data.token) setAuthToken(data.token);
    return data;
  },

  // ── Profil oluşturma ───────────────────────────────────────────────────
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(ENDPOINTS.auth.register, payload);
    setAuthToken(data.token);
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post(ENDPOINTS.auth.logout).catch(() => {});
    setAuthToken(null);
  },

  async getMe(): Promise<UserProfile> {
    const { data } = await apiClient.get<UserProfile>(ENDPOINTS.auth.me);
    return data;
  },

  async updateMe(updates: Partial<UserProfile & { avatar_url?: string }>): Promise<UserProfile> {
    const { data } = await apiClient.patch<UserProfile>(ENDPOINTS.auth.update, updates);
    return data;
  },

  async checkUsername(username: string): Promise<boolean> {
    const { data } = await apiClient.get<{ available: boolean }>(
      ENDPOINTS.auth.checkUsername(username)
    );
    return data.available;
  },
};
