// Firebase Phone Auth servisi — şu an pasif.
// Backend SMS doğrulaması aktif. Production build'de @react-native-firebase
// ile değiştirilebilir.
export const firebaseService = {
  async signOut(): Promise<void> {
    // Backend logout authStore.logout() tarafından yönetilir
  },
  async getCurrentIdToken(): Promise<string | null> {
    return null;
  },
};
