import {
  signInWithPhoneNumber,
  signOut,
  type ConfirmationResult,
  type ApplicationVerifier,
} from 'firebase/auth';
import { auth, firebaseConfig } from '../config/firebase';

export { firebaseConfig };

let pendingConfirmation: ConfirmationResult | null = null;
let pendingPhone: string | null = null;

export const firebaseService = {
  /**
   * Firebase reCAPTCHA doğrulamasıyla SMS kodu gönder.
   * recaptchaVerifier → FirebaseRecaptchaVerifierModal ref'inin .current'ı
   */
  async sendPhoneCode(
    phone: string,
    recaptchaVerifier: ApplicationVerifier,
  ): Promise<void> {
    pendingConfirmation = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
    pendingPhone = phone;
  },

  /** SMS kodunu doğrula, Firebase ID token döndür. */
  async confirmCode(code: string): Promise<{ idToken: string; phone: string }> {
    if (!pendingConfirmation) {
      throw new Error('Önce telefon numarasına kod gönderilmeli');
    }
    const credential = await pendingConfirmation.confirm(code);
    if (!credential?.user) throw new Error('Firebase doğrulama başarısız');

    const idToken = await credential.user.getIdToken();
    const phone = pendingPhone ?? credential.user.phoneNumber ?? '';
    pendingConfirmation = null;
    pendingPhone = null;
    return { idToken, phone };
  },

  /** Kodu yeniden gönder. */
  async resendCode(
    phone: string,
    recaptchaVerifier: ApplicationVerifier,
  ): Promise<void> {
    pendingConfirmation = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
    pendingPhone = phone;
  },

  /** Firebase oturumunu kapat. */
  async signOut(): Promise<void> {
    try { await signOut(auth); } catch { /* oturum yoksa sessizce geç */ }
  },

  /** Mevcut kullanıcının güncel ID token'ını al. */
  async getCurrentIdToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken(true);
  },
};
