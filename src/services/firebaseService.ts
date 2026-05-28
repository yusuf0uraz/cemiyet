import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

// Ekranlar arası taşınamayan nesneyi modül seviyesinde tutuyoruz.
// RegisterScreen → SmsVerifyScreen arasında yaşar.
let pendingConfirmation: FirebaseAuthTypes.ConfirmationResult | null = null;
let pendingPhone: string | null = null;

export const firebaseService = {
  /**
   * Firebase'e telefon numarasını gönder, SMS OTP başlat.
   * Sonuç SmsVerifyScreen'deki confirmCode() ile tüketilir.
   */
  async sendPhoneCode(phone: string): Promise<void> {
    pendingConfirmation = await auth().signInWithPhoneNumber(phone);
    pendingPhone = phone;
  },

  /**
   * 6 haneli kodu doğrula, Firebase user credential döndür.
   * Başarılıysa backend'e gönderilecek idToken'ı döndürür.
   */
  async confirmCode(code: string): Promise<{ idToken: string; phone: string }> {
    if (!pendingConfirmation) {
      throw new Error('Önce telefon numarasına kod gönderilmeli');
    }
    const credential = await pendingConfirmation.confirm(code);
    if (!credential?.user) {
      throw new Error('Firebase doğrulama başarısız');
    }
    const idToken = await credential.user.getIdToken();
    const phone = pendingPhone ?? credential.user.phoneNumber ?? '';
    pendingConfirmation = null;
    pendingPhone = null;
    return { idToken, phone };
  },

  /** Kodu yeniden gönder. */
  async resendCode(phone: string): Promise<void> {
    pendingConfirmation = await auth().signInWithPhoneNumber(phone);
    pendingPhone = phone;
  },

  /** Firebase oturumunu kapat. */
  async signOut(): Promise<void> {
    try {
      await auth().signOut();
    } catch {
      // Firebase oturumu yoksa sessizce geç
    }
  },

  /** Mevcut Firebase kullanıcısının güncel ID tokenını al. */
  async getCurrentIdToken(): Promise<string | null> {
    const user = auth().currentUser;
    if (!user) return null;
    return user.getIdToken(true);
  },
};
