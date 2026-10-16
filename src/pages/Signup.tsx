import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { authService } from '../services/authService';
import { TermsModal } from './Terms';

type DuplicateCheckStatus = 'idle' | 'checking' | 'available' | 'duplicate';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    birthDate: '',
    affiliation: '',
    licenseGrade: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkStatus, setCheckStatus] = useState<DuplicateCheckStatus>('idle');
  const [checkedEmail, setCheckedEmail] = useState('');
  const [agreeAge, setAgreeAge] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name === 'email') {
      setCheckStatus('idle');
      setCheckedEmail('');
    }
  };

  // 이메일 중복 확인
  const handleCheckDuplicate = async () => {
    const email = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setError('이메일 주소를 입력해주세요.');
      return;
    }

    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식을 입력해주세요. (예: user@example.com)');
      return;
    }

    setError('');
    setCheckStatus('checking');

    try {
      const isDuplicate = await authService.checkEmailExists(email);
      if (isDuplicate) {
        setCheckStatus('duplicate');
        setError('이미 가입된 이메일 주소입니다. 다른 이메일을 사용해주세요.');
      } else {
        setCheckStatus('available');
        setCheckedEmail(email);
      }
    } catch {
      setCheckStatus('idle');
      setError('중복 확인 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const validate = () => {
    const email = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      return '올바른 이메일 주소를 입력해주세요.';
    }

    if (checkStatus !== 'available' || checkedEmail !== email) {
      return '이메일 중복 확인을 진행해주세요.';
    }

    if (formData.password.length < 6) {
      return '비밀번호는 최소 6자 이상이어야 합니다.';
    }

    if (formData.password !== formData.confirmPassword) {
      return '비밀번호가 일치하지 않습니다.';
    }

    if (!formData.name.trim()) {
      return '이름을 입력해주세요.';
    }

    if (!formData.phone.trim()) {
      return '휴대폰번호를 입력해주세요.';
    }

    // 개인정보 보호법: 만 14세 미만은 법정대리인 동의가 필요하므로 가입을 받지 않음
    if (!agreeAge) {
      return '만 14세 이상만 회원가입할 수 있습니다.';
    }

    if (!agreeTerms || !agreePrivacy) {
      return '필수 약관에 모두 동의해주세요.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await signup({
        id: formData.email.trim(),
        email: formData.email.trim(),
        password: formData.password,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        birthDate: formData.birthDate || undefined,
        affiliation: formData.affiliation.trim() || undefined,
        licenseGrade: formData.licenseGrade.trim() || undefined
      });

      alert('회원가입이 완료되었습니다!');
      navigate('/');
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-white sm:bg-gray-50 flex flex-col"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 68px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 140px)',
      }}
    >
      <Helmet>
        <title>회원가입 - Blue Guardians</title>
      </Helmet>

      <div className="flex-grow flex items-start sm:items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-5 bg-white sm:p-9 sm:rounded-2xl sm:shadow-sm sm:border sm:border-gray-200">
          <div className="text-center hidden sm:block">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 border-b border-gray-200 pb-4">
              회원가입
            </h2>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* 1. 이메일 (아이디) + 중복확인 */}
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                이메일 (아이디) <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="이메일을 입력하세요"
                  value={formData.email}
                  onChange={handleChange}
                  className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={handleCheckDuplicate}
                  disabled={checkStatus === 'checking' || !formData.email.trim()}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white disabled:bg-gray-300 transition whitespace-nowrap"
                >
                  {checkStatus === 'checking' ? '확인 중...' : '중복 확인'}
                </button>
              </div>
              {checkStatus === 'available' && (
                <p className="text-[11px] text-emerald-600 mt-1.5 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  사용 가능한 이메일입니다.
                </p>
              )}
              {checkStatus === 'duplicate' && (
                <p className="text-[11px] text-red-600 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  이미 사용 중인 이메일입니다.
                </p>
              )}
            </div>

            {/* 2. 비밀번호 */}
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                비밀번호 (6자리 이상) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="비밀번호 입력 (6자리 이상)"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* 3. 비밀번호 확인 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="비밀번호 다시 입력"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              />
              {formData.confirmPassword && (
                formData.password === formData.confirmPassword ? (
                  <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    비밀번호가 일치합니다.
                  </p>
                ) : (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    비밀번호가 일치하지 않습니다.
                  </p>
                )
              )}
            </div>

            {/* 4. 이름 */}
            <div>
              <label htmlFor="name" className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="이름 입력"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              />
            </div>

            {/* 5. 휴대폰번호 */}
            <div>
              <label htmlFor="phone" className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                휴대폰번호 <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="010-1234-5678"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              />
            </div>

            {/* 6. 선택 항목 (생년월일, 소속, 잠수 등급) 토글 */}
            <div className="pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowOptionalFields(!showOptionalFields)}
                className="w-full flex items-center justify-between py-2 text-xs font-semibold text-gray-600 hover:text-blue-600 transition"
              >
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  다이버 / 연구원 추가 정보 (선택)
                </span>
                {showOptionalFields ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {showOptionalFields && (
                <div className="space-y-3 pt-2 bg-slate-50 p-3.5 rounded-xl border border-gray-200/80">
                  <div>
                    <label htmlFor="birthDate" className="block text-xs font-bold text-gray-600 mb-1">
                      생년월일 (선택)
                    </label>
                    <input
                      id="birthDate"
                      name="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="affiliation" className="block text-xs font-bold text-gray-600 mb-1">
                      소속 단체 / 기관 (선택)
                    </label>
                    <input
                      id="affiliation"
                      name="affiliation"
                      type="text"
                      placeholder="예: 대한잠수협회, 해양연구소"
                      value={formData.affiliation}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="licenseGrade" className="block text-xs font-bold text-gray-600 mb-1">
                      잠수 라이센스 등급 (선택)
                    </label>
                    <input
                      id="licenseGrade"
                      name="licenseGrade"
                      type="text"
                      placeholder="예: Open Water, Advanced, Rescue 등"
                      value={formData.licenseGrade}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Required consents: Google Play UGC policy (terms before posting) and 개인정보 보호법 */}
            <div className="space-y-2.5 pt-4 border-t border-gray-100">
              <label className="flex items-start gap-2 text-xs sm:text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeAge}
                  onChange={(e) => setAgreeAge(e.target.checked)}
                  className="mt-0.5 accent-blue-600"
                />
                <span>
                  <span className="text-red-500 font-bold">[필수]</span> 만 14세 이상입니다.
                </span>
              </label>
              <label className="flex items-start gap-2 text-xs sm:text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 accent-blue-600"
                />
                <span>
                  <span className="text-red-500 font-bold">[필수]</span> 이용약관에 동의합니다.{' '}
                  <button type="button" onClick={() => setShowTerms(true)} className="text-blue-600 underline">
                    보기
                  </button>
                </span>
              </label>
              <label className="flex items-start gap-2 text-xs sm:text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="mt-0.5 accent-blue-600"
                />
                <span>
                  <span className="text-red-500 font-bold">[필수]</span> 개인정보 수집·이용에 동의합니다.
                </span>
              </label>
              <div className="ml-6 text-[11px] sm:text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg p-3 leading-relaxed space-y-0.5">
                <p>수집 항목: 이메일, 비밀번호, 이름, 휴대폰번호</p>
                <p>선택 항목(생년월일, 소속, 잠수 라이선스 등급)은 입력한 경우에만 수집합니다.</p>
                <p>이용 목적: 회원 식별, 게시판 등 서비스 제공, 문의 응대</p>
                <p>보유 기간: 회원 탈퇴 시까지 (법령에 보존 의무가 있으면 해당 기간)</p>
                <p>동의를 거부할 수 있으며, 거부하면 회원가입을 할 수 없습니다.</p>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-xs sm:text-sm text-center bg-red-50 px-4 py-2.5 rounded-xl border border-red-100 whitespace-pre-line leading-relaxed">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition shadow-sm active:scale-[0.98]"
            >
              {loading ? '가입 진행 중...' : '회원가입 완료'}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                이미 계정이 있으신가요?{' '}
                <Link to="/login" className="font-bold text-blue-600 hover:text-blue-500">
                  로그인하기
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </div>
  );
};

export default Signup;
