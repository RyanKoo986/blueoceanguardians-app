import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  Users, 
  MessageSquare, 
  ExternalLink,
  Fingerprint,
  Scan,
  Mail,
  LogOut,
  UserCog,
  Search,
  Flag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { reportService, type ReportItem } from '../../services/reportService';
import { cleanupService, type CleanupItem } from '../../services/cleanupService';
import { contactService, type ContactForm } from '../../services/contactService';
import { authService } from '../../services/authService';
import { archiveService } from '../../services/archiveService';
import { moderationService, REPORT_REASONS, type ContentReport } from '../../services/moderationService';
import { biometricLabel } from '../../services/biometricService';
import { useBiometricSetting } from '../../hooks/useBiometricSetting';
import BiometricPasswordModal from '../../components/common/BiometricPasswordModal';
import type { User } from '../../types/auth';

const ROLE_LABELS: Record<string, string> = {
  USER: '일반 회원',
  RESEARCHER: '연구원',
  ADMIN: '관리자',
};

const ROLE_BADGE_STYLES: Record<string, string> = {
  USER: 'bg-slate-100 text-slate-600 border-slate-200',
  RESEARCHER: 'bg-amber-50 text-amber-700 border-amber-200',
  ADMIN: 'bg-red-50 text-red-700 border-red-200',
};

export default function AdminDashboard() {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab = (location.state as any)?.tab;
  const [activeTab, setActiveTab] = useState<'reports' | 'cleanup' | 'contacts' | 'members' | 'moderation'>(
    initialTab && ['reports', 'cleanup', 'contacts', 'members', 'moderation'].includes(initialTab) ? initialTab : 'reports'
  );
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [cleanups, setCleanups] = useState<CleanupItem[]>([]);
  const [contacts, setContacts] = useState<ContactForm[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [contentReports, setContentReports] = useState<ContentReport[]>([]);
  const [memberQuery, setMemberQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const biometric = useBiometricSetting(user?.email);
  const bioEnabled = biometric.isEnabled;
  const bioType = biometric.status?.biometryType;

  useEffect(() => {
    if ((location.state as any)?.tab) {
      setActiveTab((location.state as any).tab);
    }
  }, [location.state]);

  useEffect(() => {
    if (!isAuthenticated || (!isAdmin && user?.id !== 'admin')) {
      alert('관리자 권한이 필요합니다.');
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const [rData, cData, ctData, mData, crData] = await Promise.all([
          reportService.getReports(),
          cleanupService.getCleanups(),
          contactService.getContacts(),
          authService.getAllUsers(),
          // A failure here (e.g. migration not applied yet) must not hide the other tabs
          moderationService.getReports().catch((error) => {
            console.error('게시물 신고 로드 실패:', error);
            return [];
          }),
        ]);
        setReports(rData);
        setCleanups(cData);
        setContacts(ctData);
        setMembers(mData);
        setContentReports(crData);
      } catch (err) {
        console.error('관리자 데이터 로드 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated, isAdmin, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMarkReportRead = async (id: string) => {
    try {
      await reportService.markAsRead(id);
      setReports(prev => prev.map(r => r.id === id ? { ...r, isRead: true } : r));
    } catch {
      alert('읽음 처리에 실패했습니다.');
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm('이 제보를 삭제하시겠습니까?')) return;
    try {
      await reportService.deleteReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleRemoveReportedContent = async (report: ContentReport) => {
    if (!confirm(`신고된 ${report.commentId ? '댓글' : '게시글'}을 삭제하시겠습니까?`)) return;
    try {
      if (report.commentId) {
        await archiveService.deleteComment('', report.postId, report.commentId);
      } else {
        await archiveService.deletePost('', report.postId);
      }
      // Deleting content also deletes its reports (cascade), so reload the list from the server
      setContentReports(await moderationService.getReports());
    } catch (error) {
      alert(error instanceof Error ? error.message : '삭제에 실패했습니다.');
    }
  };

  const handleDismissContentReport = async (id: string) => {
    if (!confirm('이 신고를 기각하시겠습니까? 콘텐츠는 그대로 유지됩니다.')) return;
    try {
      await moderationService.dismissReport(id);
      setContentReports((prev) => prev.filter((report) => report.id !== id));
    } catch (error) {
      alert(error instanceof Error ? error.message : '신고 처리에 실패했습니다.');
    }
  };

  const handleMarkCleanupRead = async (id: string) => {
    try {
      await cleanupService.markAsRead(id);
      setCleanups(prev => prev.map(c => c.id === id ? { ...c, isRead: true } : c));
    } catch {
      alert('확인 처리에 실패했습니다.');
    }
  };

  const handleDeleteCleanup = async (id: string) => {
    if (!confirm('이 신청 내역을 삭제하시겠습니까?')) return;
    try {
      await cleanupService.deleteCleanup(id);
      setCleanups(prev => prev.filter(c => c.id !== id));
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleMarkContactRead = async (id: string) => {
    try {
      await contactService.markAsRead(id);
      setContacts(prev => prev.map(c => c.id === id ? { ...c, read: true } : c));
    } catch {
      alert('확인 처리에 실패했습니다.');
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('이 문의를 삭제하시겠습니까?')) return;
    try {
      await contactService.deleteContact(id);
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleChangeRole = async (member: User, role: string) => {
    if (!confirm(`${member.name || member.email} 님의 권한을 '${ROLE_LABELS[role]}'(으)로 변경하시겠습니까?`)) return;
    try {
      await authService.updateUserRole(member.id, role);
      setMembers(prev => prev.map(m => m.id === member.id ? { ...m, role } : m));
    } catch (err: any) {
      alert(err.message || '권한 변경에 실패했습니다.');
    }
  };

  const handleDeleteMember = async (member: User) => {
    if (!confirm(`${member.name || member.email} 님을 탈퇴 처리하시겠습니까?\n계정은 즉시 삭제되며, 작성한 게시물·댓글은 '탈퇴한 회원'으로 남습니다.`)) return;
    try {
      await authService.deleteUser(member.id);
      setMembers(prev => prev.filter(m => m.id !== member.id));
    } catch (err: any) {
      alert(err.message || '탈퇴 처리에 실패했습니다.');
    }
  };

  const normalizedMemberQuery = memberQuery.trim().toLowerCase();
  const filteredMembers = members.filter((m) =>
    `${m.name ?? ''} ${m.email ?? ''}`.toLowerCase().includes(normalizedMemberQuery)
  );

  return (
    <div 
      className="min-h-screen bg-slate-50 text-slate-900 px-4 sm:px-6 lg:px-8"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 76px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 110px)',
      }}
    >
      <Helmet>
        <title>관리자 관제 센터 - Blue Guardians</title>
      </Helmet>

      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-7">
        {/* Top Profile & Admin Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-500 to-rose-400 p-0.5 shadow-md flex-shrink-0">
              <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-red-600" />
              </div>
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {user?.name || '블루 가디언즈 관리자'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
                  ADMIN
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{user?.email || 'dokdo-admin@sol.com'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <Link
              to="/archive"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/80 transition active:scale-95 shadow-sm"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>게시판</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 transition active:scale-95 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>

        {/* Security & Biometric Login Card (native app only) */}
        {biometric.status?.isAvailable && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shrink-0 shadow-inner">
                {bioType === 'face' ? (
                  <Scan className="w-6 h-6" />
                ) : (
                  <Fingerprint className="w-6 h-6" />
                )}
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-slate-900">
                    생체 인증 간편 로그인
                  </h2>
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                    bioEnabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {bioEnabled ? '사용 중' : '비활성'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 leading-normal">
                  스마트폰의 {biometricLabel(bioType)}으로 비밀번호 없이 로그인합니다.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={bioEnabled}
              onClick={biometric.toggle}
              style={{
                width: '54px',
                height: '32px',
                backgroundColor: bioEnabled ? '#0284c7' : '#cbd5e1',
                transition: 'background-color 0.25s ease',
              }}
              className="relative shrink-0 cursor-pointer rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 shadow-inner"
              aria-label="생체 인증 토글"
            >
              <span
                style={{
                  width: '26px',
                  height: '26px',
                  transform: bioEnabled ? 'translateX(22px)' : 'translateX(1px)',
                  transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                className="pointer-events-none block rounded-full bg-white shadow-md"
              />
            </button>
          </div>
        )}
        {biometric.isPasswordPromptOpen && (
          <BiometricPasswordModal
            biometryLabel={biometricLabel(bioType)}
            onSubmit={biometric.enableWithPassword}
            onClose={biometric.closePasswordPrompt}
          />
        )}

        {/* Tab Navigation - Modern Segmented Control */}
        <div className="bg-slate-200/80 p-1.5 rounded-2xl grid grid-cols-2 sm:grid-cols-5 gap-1.5 shadow-inner">
          <button
            onClick={() => setActiveTab('reports')}
            className={`min-w-0 py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'reports'
                ? 'bg-white text-red-600 shadow-md border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="truncate">오류 제보</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold font-mono ${
              activeTab === 'reports' ? 'bg-red-100 text-red-700' : 'bg-slate-300 text-slate-700'
            }`}>
              {reports.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('cleanup')}
            className={`min-w-0 py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'cleanup'
                ? 'bg-white text-blue-600 shadow-md border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <Users className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="truncate">정화 신청</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold font-mono ${
              activeTab === 'cleanup' ? 'bg-blue-100 text-blue-700' : 'bg-slate-300 text-slate-700'
            }`}>
              {cleanups.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`min-w-0 py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'contacts'
                ? 'bg-white text-cyan-700 shadow-md border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-cyan-600 shrink-0" />
            <span className="truncate">1:1 문의</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold font-mono ${
              activeTab === 'contacts' ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-300 text-slate-700'
            }`}>
              {contacts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`min-w-0 py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'members'
                ? 'bg-white text-indigo-600 shadow-md border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <UserCog className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="truncate">회원</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold font-mono ${
              activeTab === 'members' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-300 text-slate-700'
            }`}>
              {members.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('moderation')}
            className={`min-w-0 py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'moderation'
                ? 'bg-white text-orange-600 shadow-md border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <Flag className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="truncate">게시물 신고</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold font-mono ${
              activeTab === 'moderation' ? 'bg-orange-100 text-orange-700' : 'bg-slate-300 text-slate-700'
            }`}>
              {contentReports.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="py-24 text-center text-slate-500 font-medium">데이터를 불러오는 중입니다...</div>
        ) : activeTab === 'reports' ? (
          <div className="space-y-4">
            {reports.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 text-slate-500 text-sm shadow-sm space-y-2">
                <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-600">접수된 오류 제보가 없습니다.</p>
                <p className="text-xs text-slate-400">새로운 시민 제보가 접수되면 이곳에 표시됩니다.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {reports.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm hover:shadow transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          item.isRead ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {item.isRead ? '확인 완료' : '신규 접수'}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        {!item.isRead && (
                          <button
                            onClick={() => handleMarkReportRead(item.id)}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-xl border border-slate-200 transition active:scale-95"
                          >
                            읽음 처리
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReport(item.id)}
                          className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-600 border border-rose-200 rounded-xl transition active:scale-95"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    {item.url && (
                      <p className="text-xs text-blue-600 flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-slate-400">제보 URL:</span>
                        <a href={item.url} target="_blank" rel="noreferrer" className="underline hover:text-blue-700">{item.url}</a>
                      </p>
                    )}
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'cleanup' ? (
          <div className="space-y-4">
            {cleanups.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 text-slate-500 text-sm shadow-sm space-y-2">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-600">접수된 수중정화 신청이 없습니다.</p>
                <p className="text-xs text-slate-400">시민들의 수중정화 참가 신청서가 접수되면 이곳에 표시됩니다.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {cleanups.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm hover:shadow transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                      <div>
                        <span className="text-base font-bold text-slate-900 mr-3">{item.name}</span>
                        <span className="text-xs text-slate-500">{item.contact} | {item.region || '전국'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          item.isRead ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {item.isRead ? '확인 완료' : '신규 신청'}
                        </span>
                        {!item.isRead && (
                          <button
                            onClick={() => handleMarkCleanupRead(item.id)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl shadow-sm transition active:scale-95"
                          >
                            확인
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCleanup(item.id)}
                          className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-600 border border-rose-200 rounded-xl transition active:scale-95"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    {item.message && (
                      <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed">{item.message}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'moderation' ? (
          <div className="space-y-4">
            {contentReports.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 text-slate-500 text-sm shadow-sm space-y-2">
                <Flag className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-600">접수된 게시물 신고가 없습니다.</p>
                <p className="text-xs text-slate-400">회원이 게시글이나 댓글을 신고하면 이곳에 표시됩니다.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {contentReports.map((report) => (
                  <div key={report.id} className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-3 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-orange-50 text-orange-700 border-orange-200">
                          {report.commentId ? '댓글' : '게시글'} · {REPORT_REASONS[report.reason]}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {new Date(report.createdAt).toLocaleDateString()} · 신고자 {report.reporterName}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDismissContentReport(report.id)}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-xl border border-slate-200 transition active:scale-95"
                        >
                          기각
                        </button>
                        <button
                          onClick={() => handleRemoveReportedContent(report)}
                          className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-600 border border-rose-200 rounded-xl transition active:scale-95"
                        >
                          {report.commentId ? '댓글 삭제' : '게시글 삭제'}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">
                      게시글 <span className="font-semibold text-slate-700">{report.postTitle}</span> · 작성자 {report.targetAuthorName}
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 whitespace-pre-line max-h-40 overflow-y-auto">
                      {report.targetContent}
                    </p>
                    {report.detail && <p className="text-xs text-slate-500">신고 내용: {report.detail}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'members' ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={memberQuery}
                onChange={(e) => setMemberQuery(e.target.value)}
                placeholder="이름 또는 이메일 검색"
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-200 shadow-sm"
              />
            </div>
            {filteredMembers.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 text-slate-500 text-sm shadow-sm space-y-2">
                <UserCog className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-600">
                  {members.length === 0 ? '가입한 회원이 없습니다.' : '검색 결과가 없습니다.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredMembers.map((member) => {
                  const role = member.role || 'USER';
                  const isSelf = member.id === user?.id;
                  return (
                    <div key={member.id} className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm hover:shadow transition">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-bold text-slate-900">{member.name || '이름 없음'}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${ROLE_BADGE_STYLES[role] ?? ROLE_BADGE_STYLES.USER}`}>
                              {ROLE_LABELS[role] ?? role}
                            </span>
                            {isSelf && <span className="text-[11px] font-medium text-slate-400">내 계정</span>}
                          </div>
                          <p className="text-xs text-slate-500 truncate">{member.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={role}
                            disabled={isSelf}
                            onChange={(e) => handleChangeRole(member, e.target.value)}
                            aria-label="회원 권한"
                            className="px-3 py-1.5 font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-xl disabled:opacity-50"
                          >
                            {Object.entries(ROLE_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleDeleteMember(member)}
                            disabled={isSelf}
                            className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-600 border border-rose-200 rounded-xl transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                          >
                            탈퇴 처리
                          </button>
                        </div>
                      </div>
                      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        {[
                          ['연락처', member.phone],
                          ['소속', member.affiliation],
                          ['자격 등급', member.licenseGrade],
                          ['가입일', member.createdAt && new Date(member.createdAt).toLocaleDateString()],
                        ].map(([label, value]) => (
                          <div key={label} className="min-w-0">
                            <dt className="text-slate-400 mb-0.5">{label}</dt>
                            <dd className="text-slate-700 font-medium truncate">{value || '-'}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 text-slate-500 text-sm shadow-sm space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-600">접수된 문의사항이 없습니다.</p>
                <p className="text-xs text-slate-400">고객센터를 통해 접수된 1:1 문의가 이곳에 표시됩니다.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {contacts.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm hover:shadow transition">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-base font-bold text-slate-900 mr-2">{item.name}</span>
                        <span className="text-xs text-slate-500">{item.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                        {!item.read && (
                          <button
                            onClick={() => handleMarkContactRead(item.id)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-xl border border-slate-200 transition active:scale-95"
                          >
                            읽음
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteContact(item.id)}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-600 border border-rose-200 rounded-xl transition active:scale-95"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed">{item.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
