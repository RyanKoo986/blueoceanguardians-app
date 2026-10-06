import { useState, type FormEvent } from 'react';
import { Fingerprint, X } from 'lucide-react';

interface BiometricPasswordModalProps {
  biometryLabel: string;
  onSubmit: (password: string) => Promise<void>;
  onClose: () => void;
}

// Confirms the current password before it is stored behind biometrics on this device
export default function BiometricPasswordModal({ biometryLabel, onSubmit, onClose }: BiometricPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setError('');
    setSubmitting(true);
    try {
      await onSubmit(password);
    } catch (err: any) {
      setError(err.message || '비밀번호를 확인해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-gray-900">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Fingerprint className="w-6 h-6" />
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="닫기">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-bold">{biometryLabel} 간편 로그인 등록</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            본인 확인을 위해 현재 비밀번호를 입력해 주세요. 비밀번호는 이 기기의 보안 저장소에만 암호화되어 저장됩니다.
          </p>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          autoComplete="current-password"
          autoFocus
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={submitting || !password}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 transition"
          >
            {submitting ? '확인 중...' : '확인 후 등록'}
          </button>
        </div>
      </form>
    </div>
  );
}
