import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, FileText, AlertTriangle, Users, MessageSquare, Check, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { reportService, type ReportItem } from '../../services/reportService';
import { cleanupService, type CleanupItem } from '../../services/cleanupService';
import { contactService, type ContactForm } from '../../services/contactService';

export default function AdminDashboard() {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab = (location.state as any)?.tab;
  const [activeTab, setActiveTab] = useState<'reports' | 'cleanup' | 'contacts'>(
    initialTab && ['reports', 'cleanup', 'contacts'].includes(initialTab) ? initialTab : 'reports'
  );
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [cleanups, setCleanups] = useState<CleanupItem[]>([]);
  const [contacts, setContacts] = useState<ContactForm[]>([]);
  const [loading, setLoading] = useState(true);

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
    loadData();
  }, [isAuthenticated, isAdmin, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rData, cData, ctData] = await Promise.all([
        reportService.getReports(),
        cleanupService.getCleanups(),
        contactService.getContacts(),
      ]);
      setReports(rData);
      setCleanups(cData);
      setContacts(ctData);
    } catch (err) {
      console.error('관리자 데이터 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReportRead = async (id: string) => {
    try {
      await reportService.markAsRead(id);
      setReports(prev => prev.map(r => r.id === id ? { ...r, isRead: true } : r));
    } catch (err) {
      alert('읽음 처리에 실패했습니다.');
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm('이 제보를 삭제하시겠습니까?')) return;
    try {
      await reportService.deleteReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleMarkCleanupRead = async (id: string) => {
    try {
      await cleanupService.markAsRead(id);
      setCleanups(prev => prev.map(c => c.id === id ? { ...c, isRead: true } : c));
    } catch (err) {
      alert('확인 처리에 실패했습니다.');
    }
  };

  const handleDeleteCleanup = async (id: string) => {
    if (!confirm('이 신청 내역을 삭제하시겠습니까?')) return;
    try {
      await cleanupService.deleteCleanup(id);
      setCleanups(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleMarkContactRead = async (id: string) => {
    try {
      await contactService.markAsRead(id);
      setContacts(prev => prev.map(c => c.id === id ? { ...c, read: true } : c));
    } catch (err) {
      alert('확인 처리에 실패했습니다.');
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('이 문의를 삭제하시겠습니까?')) return;
    try {
      await contactService.deleteContact(id);
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-24 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>관리자 관제 센터 - Blue Guardians</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight">관리자 관제 센터</h1>
              <p className="text-xs text-gray-400 mt-0.5">시민 제보 · 수중정화 신청 · 고객 문의 실시간 관리</p>
            </div>
          </div>

          <Link
            to="/archive"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl border border-white/10 transition text-gray-200 shrink-0"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">아카이브</span> 게시판
          </Link>
        </div>

        {/* Tab Navigation - Modern Segmented Control */}
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-1.5 flex gap-1.5 shadow-lg backdrop-blur-md">
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-red-500/25 text-red-300 border border-red-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="truncate">오류 제보</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-red-500/30 text-red-200 font-mono">
              {reports.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('cleanup')}
            className={`flex-1 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'cleanup'
                ? 'bg-blue-500/25 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">정화 신청</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 font-mono">
              {cleanups.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'contacts'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">1:1 문의</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-cyan-500/30 text-cyan-200 font-mono">
              {contacts.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="py-20 text-center text-gray-400">데이터를 불러오는 중입니다...</div>
        ) : activeTab === 'reports' ? (
          <div className="space-y-4">
            {reports.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-white/5 text-gray-400 text-sm">
                접수된 오류 제보가 없습니다.
              </div>
            ) : (
              <div className="grid gap-4">
                {reports.map((item) => (
                  <div key={item.id} className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          item.isRead ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                          {item.isRead ? '확인 완료' : '신규 접수'}
                        </span>
                        <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        {!item.isRead && (
                          <button
                            onClick={() => handleMarkReportRead(item.id)}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg transition"
                          >
                            읽음 처리
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReport(item.id)}
                          className="px-3 py-1 bg-red-950/50 hover:bg-red-900/60 text-xs text-red-300 border border-red-800/40 rounded-lg transition"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    {item.url && (
                      <p className="text-xs text-cyan-400 flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" />
                        URL: <a href={item.url} target="_blank" rel="noreferrer" className="underline">{item.url}</a>
                      </p>
                    )}
                    <p className="text-sm text-gray-200 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'cleanup' ? (
          <div className="space-y-4">
            {cleanups.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-white/5 text-gray-400 text-sm">
                접수된 수중정화 신청이 없습니다.
              </div>
            ) : (
              <div className="grid gap-4">
                {cleanups.map((item) => (
                  <div key={item.id} className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                      <div>
                        <span className="text-base font-bold text-white mr-3">{item.name}</span>
                        <span className="text-xs text-gray-400">{item.contact} | {item.region || '전국'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          item.isRead ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {item.isRead ? '확인 완료' : '신규 신청'}
                        </span>
                        {!item.isRead && (
                          <button
                            onClick={() => handleMarkCleanupRead(item.id)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-xs text-white rounded-lg transition"
                          >
                            확인
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCleanup(item.id)}
                          className="px-3 py-1 bg-red-950/50 hover:bg-red-900/60 text-xs text-red-300 border border-red-800/40 rounded-lg transition"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    {item.message && (
                      <p className="text-xs text-gray-300 bg-slate-950/60 p-3 rounded-xl">{item.message}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-white/5 text-gray-400 text-sm">
                접수된 문의사항이 없습니다.
              </div>
            ) : (
              <div className="grid gap-4">
                {contacts.map((item) => (
                  <div key={item.id} className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div>
                        <span className="text-base font-bold text-white mr-2">{item.name}</span>
                        <span className="text-xs text-gray-400">{item.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                        {!item.read && (
                          <button
                            onClick={() => handleMarkContactRead(item.id)}
                            className="px-2.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-xs rounded transition"
                          >
                            읽음
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteContact(item.id)}
                          className="px-2.5 py-0.5 bg-red-950/50 hover:bg-red-900/60 text-xs text-red-300 rounded transition"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed">{item.message}</p>
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
