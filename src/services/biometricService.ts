import { Capacitor } from '@capacitor/core';
import { AccessControl, AuthenticationStrength, BiometryType, NativeBiometric } from '@capgo/capacitor-native-biometric';

// Keystore/Keychain entry holding the login; only readable after a live biometric check
const CREDENTIAL_SERVER = 'com.blueoceanguardians.app';
// Non-secret marker so the UI can show which account is registered on this device
const REGISTERED_EMAIL_KEY = 'dokdo_biometric_email';
// Former simulated implementation stored the user object (incl. role) here
const LEGACY_KEYS = ['dokdo_biometric_enabled', 'dokdo_biometric_credentials'];
// APP_CANCEL, SYSTEM_CANCEL, USER_CANCEL
const CANCEL_CODES = ['11', '15', '16'];
const NO_PROTECTED_CREDENTIALS_FOUND = '21';

export type BiometryKind = 'fingerprint' | 'face' | 'biometrics';

export interface BiometricStatus {
  isAvailable: boolean;
  biometryType: BiometryKind;
  isEnabled: boolean;
  registeredEmail: string | null;
}

const toKind = (type: BiometryType): BiometryKind => {
  if (type === BiometryType.FACE_ID || type === BiometryType.FACE_AUTHENTICATION) return 'face';
  if (type === BiometryType.TOUCH_ID || type === BiometryType.FINGERPRINT) return 'fingerprint';
  return 'biometrics';
};

export const isBiometricCancel = (err: unknown): boolean =>
  CANCEL_CODES.includes(String((err as { code?: unknown })?.code));

export const biometricLabel = (kind?: BiometryKind): string =>
  kind === 'face' ? '얼굴 인증' : kind === 'fingerprint' ? '지문 인증' : '생체 인증';

export const biometricService = {
  // Native app only: the web build has no secure hardware-backed storage
  async getStatus(): Promise<BiometricStatus> {
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
    const registeredEmail = localStorage.getItem(REGISTERED_EMAIL_KEY);

    if (!Capacitor.isNativePlatform()) {
      return { isAvailable: false, biometryType: 'biometrics', isEnabled: false, registeredEmail: null };
    }

    const { isAvailable, authenticationStrength, biometryType } = await NativeBiometric.isAvailable().catch(() => ({
      isAvailable: false,
      authenticationStrength: AuthenticationStrength.NONE,
      biometryType: BiometryType.NONE,
    }));
    // Keystore/Keychain-bound credentials need strong biometrics (fingerprint, Face ID, Class 3 face);
    // weak-only face unlock on many Android phones cannot unlock them
    const hasStrongBiometrics = isAvailable && authenticationStrength === AuthenticationStrength.STRONG;

    return {
      isAvailable: hasStrongBiometrics,
      biometryType: toKind(biometryType),
      isEnabled: hasStrongBiometrics && Boolean(registeredEmail),
      registeredEmail,
    };
  },

  // Saves the verified login behind biometrics (Android shows the prompt while saving)
  async enable(email: string, password: string): Promise<void> {
    await NativeBiometric.setCredentials({
      username: email,
      password,
      server: CREDENTIAL_SERVER,
      accessControl: AccessControl.BIOMETRY_ANY,
      title: '생체 인증 등록',
      negativeButtonText: '취소',
    });
    localStorage.setItem(REGISTERED_EMAIL_KEY, email);
  },

  async disable(): Promise<void> {
    localStorage.removeItem(REGISTERED_EMAIL_KEY);
    if (Capacitor.isNativePlatform()) {
      await NativeBiometric.deleteCredentials({ server: CREDENTIAL_SERVER }).catch(() => {});
    }
  },

  // The biometric prompt is cryptographically bound to decrypting the stored login
  async unlockCredentials(): Promise<{ email: string; password: string }> {
    try {
      const { username, password } = await NativeBiometric.getSecureCredentials({
        server: CREDENTIAL_SERVER,
        reason: 'Blue Ocean Guardians 간편 로그인',
        title: '생체 인증 로그인',
        negativeButtonText: '취소',
      });
      return { email: username, password };
    } catch (err) {
      // Entry was removed (e.g. all biometrics deleted on the device)
      if (String((err as { code?: unknown })?.code) === NO_PROTECTED_CREDENTIALS_FOUND) {
        await this.disable();
        throw new Error('기기에 저장된 생체 인증 정보가 없습니다.\n비밀번호로 로그인한 뒤 다시 등록해 주세요.');
      }
      throw err;
    }
  },
};
