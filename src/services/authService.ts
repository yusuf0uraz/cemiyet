import { apiClient, setAuthToken } from './apiClient';
import { ENDPOINTS } from '../config/api';
import type { UserProfile } from '../store/authStore';

export interface FirebaseVerifyResponse {
  token: string | null;
  user: UserProfile | null;
  phone: string;
  isNew: boolean;
  firebaseUid?: string;
}

export interface RegisterPayload {
  firebaseUid: string;
  phone: string;
  name: string;
  username: string;
  bio?: string;
  city?: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export const authService = {
  /** Firebase ID token ile backend'e giriş yap / kullanıcı doğrula. */
  async firebaseVerify(idToken: string): Promise<FirebaseVerifyResponse> {
    const { data } = await apiClient.post<FirebaseVerifyResponse>(
      ENDPOINTS.auth.firebaseVerify,
      { idToken }
    );
    if (data.token) setAuthToken(data.token);
    return data;
  },

  /** Yeni kullanıcı profili oluştur. */
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
