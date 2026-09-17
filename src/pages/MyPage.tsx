import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Shield, Award, Phone, MapPin, LogOut, Trash2, AlertTriangle, MessageSquare, Waves, ChevronRight, Fingerprint, Scan } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { biometricService } from '../services/biometricService';

export default function MyPage() {
  const { user, isAuthenticated, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(false);
  const [bioType, setBioType] = useState<'fingerprint' | 'face' | 'biometrics'>('fingerprint');

  React.useEffect(() => {
    biometricService.checkAvailability().then((status) => {
      setBioEnabled(status.isEnabled);
      setBioType(status.biometryType as any);
    });
  }, []);

  const handleToggleBiometric = async () => {
    if (!user) return;
    if (bioEnabled) {
      biometricService.disableBiometric();
      setBioEnabled(false);
    } else {
      const success = await biometricService.enableBiometric(user);
      if (success) {
        setBioEnabled(true);
      }
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4 pt-20">
        <Helmet>
          <title>마이페이지 - Blue Guardians</title>
        </Helmet>
        <div className="max-w-md w-full text-center bg-gray-800/80 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
          <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold mb-2">로그인이 필요합니다</h2>
          <p className="text-gray-400 mb-6 text-sm">
            회원 정보 및 활동 내역을 확인하시려면 먼저 로그인해 주세요.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/login"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-medium text-sm transition"
            >
              로그인
            </Link>
            <Link
              to="/"
              className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl text-gray-200 font-medium text-sm transition"
            >
              홈으로
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== '탈퇴') {
      alert("'탈퇴'를 정확히 입력해주세요.");
      return;
    }

    try {
      setIsDeleting(true);
      await deleteAccount();
      alert('회원 탈퇴 및 계정 데이터 삭제가 완료되었습니다.');
      navigate('/');
    } catch (err: any) {
      alert(err.message || '탈퇴 처리에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>마이페이지 - Blue Guardians</title>
      </Helmet>

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header Card */}
        <div className="relative bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 p-1 flex-shrink-0 shadow-lg">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-cyan-300" />
              </div>
            </div>

            <div className="text-center sm:text-left flex-grow space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
                  {user.name || '가디언즈 회원'}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  user.role === 'ADMIN' 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                    : user.role === 'RESEARCHER'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {user.role === 'ADMIN' ? '관리자 (ADMIN)' : user.role === 'RESEARCHER' ? '연구원 (RESEARCHER)' : '일반 회원 (GUARDIAN)'}
                </span>
              </div>
              <p className="text-gray-400 text-sm flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Admin Control Center Section (Only for ADMIN) */}
        {user.role === 'ADMIN' && (
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950/80 border border-red-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    관리자 관제 센터
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                      LIVE
                    </span>
                  </h2>
                  <p className="text-xs text-gray-300 mt-0.5">시민 제보, 수중정화 신청, 고객 문의 실시간 처리</p>
                </div>
              </div>

              <Link
                to="/admin"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-sm font-bold shadow-lg shadow-red-900/30 transition active:scale-95"
              >
                통합 대시보드 바로가기
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <button
                type="button"
                onClick={() => navigate('/admin', { state: { tab: 'reports' } })}
                className="text-left p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-red-500/20 hover:border-red-500/40 transition group active:scale-[0.98] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-red-400 transition" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-red-300 transition">시민 오류 제보 관리</h3>
                  <p className="text-xs text-gray-400 mt-1">AI 왜곡 정보 및 시민 신고 내역 검토·삭제</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin', { state: { tab: 'cleanup' } })}
                className="text-left p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-blue-500/20 hover:border-blue-500/40 transition group active:scale-[0.98] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                    <Waves className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition">수중정화 신청자 관리</h3>
                  <p className="text-xs text-gray-400 mt-1">봉사활동 신청서, 연락처, 지역 확인</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin', { state: { tab: 'contacts' } })}
                className="text-left p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-cyan-500/20 hover:border-cyan-500/40 transition group active:scale-[0.98] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">1:1 문의사항 관리</h3>
                  <p className="text-xs text-gray-400 mt-1">고객센터 접수 문의 조회 및 확인 처리</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Profile Info Details (Only for General Users/Researchers) */}
        {user.role !== 'ADMIN' && (
          <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 backdrop-blur-md">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              내 프로필 정보
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 space-y-1">
                <span className="text-gray-400 text-xs flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                  소속 / 직책
                </span>
                <p className="text-gray-200 font-medium">{user.affiliation || '미입력'}</p>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 space-y-1">
                <span className="text-gray-400 text-xs flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  잠수 자격 등급
                </span>
                <p className="text-gray-200 font-medium">{user.licenseGrade || '미입력'}</p>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 space-y-1">
                <span className="text-gray-400 text-xs flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  연락처
                </span>
                <p className="text-gray-200 font-medium">{user.phone || '미입력'}</p>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 space-y-1">
                <span className="text-gray-400 text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  활동 지역
                </span>
                <p className="text-gray-200 font-medium">{user.address || '미입력'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Security & Biometric Login Settings */}
        <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-5 sm:p-7 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}
              >
                {bioType === 'face' ? (
                  <Scan className="w-5 h-5" />
                ) : (
                  <Fingerprint className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 flex-wrap">
                  생체 인증 간편 로그인
                  {bioEnabled ? (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        color: '#34d399',
                        borderColor: 'rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      사용 중
                    </span>
                  ) : (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
                      style={{
                        backgroundColor: 'rgba(156, 163, 175, 0.2)',
                        color: '#9ca3af',
                        borderColor: 'rgba(156, 163, 175, 0.3)',
                      }}
                    >
                      비활성
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  스마트폰의 {bioType === 'face' ? 'Face ID' : '지문 센서'}를 사용하여 비밀번호 없이 즉시 로그인합니다.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={bioEnabled}
              onClick={handleToggleBiometric}
              style={{
                width: '52px',
                height: '30px',
                backgroundColor: bioEnabled ? '#06b6d4' : '#4b5563',
                transition: 'background-color 0.25s ease',
              }}
              className="relative shrink-0 cursor-pointer rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  transform: bioEnabled ? 'translateX(22px)' : 'translateX(1px)',
                  transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                className="pointer-events-none block rounded-full bg-white shadow-md"
              />
            </button>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-slate-800/40 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-sm font-semibold text-gray-200">계정 관리</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {user.role === 'ADMIN' ? '안전하게 로그아웃할 수 있습니다.' : '안전하게 로그아웃하거나 계정 탈퇴를 진행할 수 있습니다.'}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-700 hover:bg-gray-600 text-gray-200 transition"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
            {user.role !== 'ADMIN' && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-700/40 transition"
              >
                <Trash2 className="w-4 h-4" />
                회원 탈퇴
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Account Deletion Modal (Apple App Store Guideline 5.1.1 compliant) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">회원 탈퇴 안내</h3>
                <p className="text-xs text-gray-400">계정 삭제 시 모든 정보가 영구 삭제됩니다.</p>
              </div>
            </div>

            <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-4 text-xs text-gray-300 space-y-2 leading-relaxed">
              <p>• 탈퇴 시 프로필 및 등록된 활동 내역이 즉시 영구 삭제되며 복구할 수 없습니다.</p>
              <p>• 진행을 원하시면 아래에 <strong>'탈퇴'</strong>를 입력해 주세요.</p>
            </div>

            <div>
              <input
                type="text"
                placeholder="'탈퇴' 입력"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full bg-slate-800 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmText !== '탈퇴'}
                className="px-5 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white transition"
              >
                {isDeleting ? '삭제 중...' : '영구 탈퇴 확인'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
