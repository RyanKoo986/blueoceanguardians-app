import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { Fingerprint, Scan, ShieldCheck, CheckCircle, X, KeyRound, Mail, ArrowRight } from 'lucide-react';
import { biometricService, type BiometricStatus } from '../services/biometricService';
import { authService } from '../services/authService';

const Login = () => {
  const [formData, setFormData] = useState({
    id: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [bioStatus, setBioStatus] = useState<BiometricStatus | null>(null);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const [pendingLoggedInUser, setPendingLoggedInUser] = useState<any>(null);

  // 비밀번호 재설정 모달 관련 상태
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // 생체 인증 지원 여부 및 등록 상태 조회
    biometricService.checkAvailability().then((status) => {
      setBioStatus(status);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 일반 이메일/비밀번호 로그인
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      
      // 생체 인증 미등록 상태일 때 등록 권유 팝업 표시
      const currentStatus = await biometricService.checkAvailability();
      if (currentStatus.isAvailable && !currentStatus.isEnabled) {
        setPendingLoggedInUser(formData);
        setShowRegisterPrompt(true);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 지문 / Face ID 간편 로그인 실행
  const handleBiometricLogin = async () => {
    setError('');
    setBiometricLoading(true);

    try {
      if (!bioStatus?.isEnabled) {
        throw new Error('등록된 생체 인증 정보가 없습니다.\n아이디와 비밀번호로 1회 로그인하여 생체 인증을 활성화해주세요.');
      }

      await biometricService.authenticateAndLogin();
      navigate('/');
    } catch (err: any) {
      setError(err.message || '생체 인증에 실패했습니다.');
    } finally {
      setBiometricLoading(false);
    }
  };

  // 생체 인증 등록 승인
  const handleConfirmBiometricRegister = async () => {
    if (pendingLoggedInUser) {
      const currentUser = JSON.parse(localStorage.getItem('dokdo_current_user') || '{}');
      await biometricService.enableBiometric(currentUser);
    }
    setShowRegisterPrompt(false);
    navigate('/');
  };

  // 비밀번호 재설정 이메일 발송
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail.trim()) {
      setForgotError('이메일 주소를 입력해주세요.');
      return;
    }

    setForgotLoading(true);
    try {
      await authService.resetPassword(forgotEmail);
      setForgotSuccess(true);
    } catch (err: any) {
      setForgotError(err.message || '이메일 발송에 실패했습니다. 이메일 주소를 다시 확인해주세요.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white sm:bg-gray-50 flex flex-col pt-[55px] sm:pt-[80px]">
      <Helmet>
        <title>로그인 - Blue Guardians</title>
      </Helmet>

      <div className="flex-grow flex items-center justify-center pt-6 pb-28 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 sm:space-y-8 bg-white sm:p-10 sm:rounded-2xl sm:shadow-sm sm:border sm:border-gray-200">
          <div className="text-center hidden sm:block">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 border-b border-gray-200 pb-5 mb-6">
              로그인
            </h2>
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="id" className="block text-sm font-bold text-gray-700 mb-1">
                  아이디 또는 이메일
                </label>
                <input
                  id="id"
                  name="id"
                  type="text"
                  required
                  className="appearance-none block w-full px-3.5 py-2.5 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="아이디 또는 이메일을 입력하세요"
                  value={formData.id}
                  onChange={handleChange}
                />
              </div>
              
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="appearance-none block w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="비밀번호를 입력하세요"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-xs sm:text-sm text-center bg-red-50 px-4 py-2.5 rounded-xl border border-red-100 whitespace-pre-line leading-relaxed">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between text-xs sm:text-sm">
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="font-semibold text-blue-600 hover:text-blue-500"
                >
                  회원가입
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForgotError('');
                    setForgotSuccess(false);
                    setForgotEmail(formData.id.includes('@') ? formData.id : '');
                    setShowForgotModal(true);
                  }}
                  className="font-medium text-gray-500 hover:text-gray-900"
                >
                  비밀번호 찾기
                </button>
            </div>

            <button
              type="submit"
              disabled={loading || biometricLoading}
              className="w-full py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition shadow-sm active:scale-[0.98]"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>

            {/* 🔐 생체 인증 간편 로그인 버튼 */}
            <div className="pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleBiometricLogin}
                disabled={loading || biometricLoading}
                className={`w-full py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2.5 font-bold text-xs sm:text-sm transition-all duration-200 shadow-sm active:scale-[0.98] ${
                  bioStatus?.isEnabled
                    ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {bioStatus?.biometryType === 'face' ? (
                  <Scan className="w-4 h-4 text-cyan-500" />
                ) : (
                  <Fingerprint className="w-4 h-4 text-cyan-500" />
                )}
                <span>
                  {biometricLoading
                    ? '생체 인증 확인 중...'
                    : bioStatus?.isEnabled
                    ? '지문 / Face ID로 간편 로그인'
                    : '지문 / Face ID 간편 로그인 (안내)'}
                </span>
              </button>
              {bioStatus?.isEnabled && bioStatus.registeredEmail && (
                <p className="text-[11px] text-center text-gray-400 mt-1.5 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500 inline" />
                  기기에 등록된 계정: <span className="font-semibold text-gray-600">{bioStatus.registeredEmail}</span>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* 팝업 모달 1: 최초 로그인 성공 시 생체 인증 등록 권유 */}
      {showRegisterPrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Fingerprint className="w-6 h-6" />
              </div>
              <button
                onClick={() => {
                  setShowRegisterPrompt(false);
                  navigate('/');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-gray-900">
                생체 인증(지문 / Face ID) 등록
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                다음 로그인부터 비밀번호 입력 없이 스마트폰 지문이나 Face ID로 1초 만에 간편하게 로그인하시겠습니까?
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowRegisterPrompt(false);
                  navigate('/');
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
              >
                나중에 하기
              </button>
              <button
                type="button"
                onClick={handleConfirmBiometricRegister}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                지금 등록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 팝업 모달 2: 비밀번호 찾기 (이메일 재설정 링크 발송) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <KeyRound className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-gray-900">재설정 링크 발송 완료</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    <span className="font-semibold text-blue-600">{forgotEmail}</span> 주소로 비밀번호 재설정 링크를 전송했습니다.<br />
                    이메일함을 확인하여 비밀번호를 새로 설정해주세요.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs transition"
                >
                  닫기
                </button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSendResetEmail}>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-gray-900">비밀번호 찾기</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    가입하신 이메일 주소를 입력하시면 비밀번호를 재설정할 수 있는 링크를 보내드립니다.
                  </p>
                </div>

                <div>
                  <label htmlFor="forgot-email" className="block text-xs font-bold text-gray-700 mb-1">
                    이메일 주소
                  </label>
                  <div className="relative">
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      placeholder="example@guardians.org"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {forgotError && (
                  <div className="text-red-600 text-xs bg-red-50 p-2.5 rounded-xl border border-red-100">
                    {forgotError}
                  </div>
                )}

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition flex items-center justify-center gap-1.5 disabled:bg-gray-400"
                  >
                    {forgotLoading ? (
                      <span>발송 중...</span>
                    ) : (
                      <>
                        <span>재설정 링크 전송</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
