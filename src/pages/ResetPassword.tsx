import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { KeyRound, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 서로 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      await authService.updatePassword(newPassword);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || '비밀번호 변경에 실패했습니다. 유효하지 않거나 만료된 링크일 수 있습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-gray-50 flex flex-col"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 68px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 140px)',
      }}
    >
      <Helmet>
        <title>새 비밀번호 설정 - Blue Guardians</title>
      </Helmet>

      <div className="flex-grow flex items-start sm:items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              새 비밀번호 설정
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              새롭게 사용할 비밀번호를 6자리 이상 입력해주세요.
            </p>
          </div>

          {isSuccess ? (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900">비밀번호 변경 완료!</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  비밀번호가 안전하게 변경되었습니다.<br />새로운 비밀번호로 로그인해주세요.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <span>로그인하러 가기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                    새 비밀번호 (6자리 이상)
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="새 비밀번호 입력"
                      className="appearance-none block w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                    새 비밀번호 확인
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="새 비밀번호 다시 입력"
                      className="appearance-none block w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>비밀번호 표시</span>
                  </label>
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
                {loading ? '비밀번호 변경 중...' : '비밀번호 변경 완료'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
