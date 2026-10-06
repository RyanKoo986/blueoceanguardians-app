import { useCallback, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { biometricService, isBiometricCancel, type BiometricStatus } from '../services/biometricService';

// Settings-page toggle: turning biometrics on re-checks the password before storing it on the device
export function useBiometricSetting(email?: string) {
  const [status, setStatus] = useState<BiometricStatus | null>(null);
  const [isPasswordPromptOpen, setPasswordPromptOpen] = useState(false);

  const refresh = useCallback(() => biometricService.getStatus().then(setStatus), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isEnabled = Boolean(email && status?.isEnabled && status.registeredEmail === email);

  const toggle = async () => {
    if (isEnabled) {
      await biometricService.disable();
      await refresh();
      return;
    }
    setPasswordPromptOpen(true);
  };

  const enableWithPassword = async (password: string) => {
    if (!email) return;
    await authService.login({ email, password });
    try {
      await biometricService.enable(email, password);
    } catch (err) {
      if (!isBiometricCancel(err)) throw new Error('생체 인증 등록에 실패했습니다.');
    }
    setPasswordPromptOpen(false);
    await refresh();
  };

  return {
    status,
    isEnabled,
    toggle,
    isPasswordPromptOpen,
    closePasswordPrompt: () => setPasswordPromptOpen(false),
    enableWithPassword,
  };
}
