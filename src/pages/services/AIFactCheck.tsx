import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, Upload, X, Check, Globe, Lock, RefreshCw, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { aiService, type FactCheckResponse } from '../../services/aiService';
import { archiveService } from '../../services/archiveService';

export default function AIFactCheck() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [boardType, setBoardType] = useState<'dokdo' | 'cleanup' | 'research' | 'notice'>('dokdo');
  const [authorName, setAuthorName] = useState(user?.name || (user?.id ? user.id : '독도 가디언'));
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  // AI Fact Check state
  const [aiChecking, setAiChecking] = useState(false);
  const [aiResult, setAiResult] = useState<FactCheckResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // File handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);

    const validFiles = selected.filter((file) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (isImage) return file.size <= 20 * 1024 * 1024;
      if (isVideo) return file.size <= 100 * 1024 * 1024;
      return false;
    });

    if (validFiles.length !== selected.length) {
      alert('이미지(최대 20MB) 또는 동영상(최대 100MB) 파일만 첨부할 수 있습니다.');
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // AI Fact Check execution
  const handleRunAiCheck = async () => {
    if (!content.trim()) {
      alert('AI 검사를 실행할 본문 내용을 먼저 입력해주세요.');
      return;
    }

    try {
      setAiChecking(true);
      setAiResult(null);
      const res = await aiService.factCheck(content);
      setAiResult(res);
    } catch (err: any) {
      alert(err.message || 'AI 팩트체크 분석에 실패했습니다.');
    } finally {
      setAiChecking(false);
    }
  };

  // Apply AI corrected content to textarea
  const handleApplyCorrection = () => {
    if (aiResult?.correctedContent) {
      setContent(aiResult.correctedContent);
      alert('AI 교정본이 본문에 반영되었습니다.');
    }
  };

  // Submit to archive
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      await archiveService.createPost(boardType, {
        title: title.trim(),
        content: content.trim(),
        authorId: user?.id || 'guest',
        authorName: authorName.trim() || '독도 가디언',
        visibility,
        files,
      });

      alert('독도 자료가 성공적으로 등록되었습니다.');
      navigate(`/archive?tab=${boardType}`);
    } catch (err: any) {
      alert(err.message || '게시글 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-28 md:pb-16">
      <Helmet>
        <title>독도 자료 등록 & AI 팩트체크 - Blue Guardians</title>
        <meta
          name="description"
          content="독도 자료를 등록하고 실시간 AI 팩트체크를 통해 역사적 사실을 검증합니다."
        />
      </Helmet>

      {/* Standardized Hero Section */}
      <section className="relative min-h-[38vh] sm:h-[40vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/dokdo photo/IMG_20250614_102346_101.jpeg"
            alt="독도 풍경"
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
        <div className="absolute inset-0 bg-black/40 z-10" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 tracking-wider">
            독도 자료 등록 & AI 팩트체크
          </h1>
          <p className="text-sm sm:text-lg text-gray-200 tracking-wide font-light">
            AI가 실시간으로 역사 왜곡 표현을 정밀 분석하고 올바른 정보를 제안합니다
          </p>
        </div>
      </section>

      {/* Main Form Area */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-5 sm:px-6 py-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-cyan-300" />
              <h2 className="text-base sm:text-lg font-bold tracking-wide">자료 등록 작성 양식</h2>
            </div>
            <span className="text-xs text-blue-200 hidden sm:inline-block">
              * 표시는 필수 입력 항목입니다
            </span>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5 text-sm">
            
            {/* 제목 */}
            <div className="space-y-1.5">
              <label htmlFor="title" className="block font-bold text-gray-800 text-xs sm:text-sm">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="게시글 제목을 입력하세요"
                required
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>

            {/* 분류 & 작성자 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="boardType" className="block font-bold text-gray-800 text-xs sm:text-sm">
                  게시판 분류 <span className="text-red-500">*</span>
                </label>
                <select
                  id="boardType"
                  value={boardType}
                  onChange={(e) => setBoardType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 text-sm"
                >
                  <option value="dokdo">독도 자료</option>
                  <option value="cleanup">수중 정화 활동</option>
                  <option value="notice">공지사항</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="authorName" className="block font-bold text-gray-800 text-xs sm:text-sm">
                  작성자 <span className="text-red-500">*</span>
                </label>
                <input
                  id="authorName"
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 text-sm"
                />
              </div>
            </div>

            {/* 공개 설정 */}
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-800 text-xs sm:text-sm">
                공개 설정
              </label>
              <div className="flex items-center gap-6 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={visibility === 'public'}
                    onChange={() => setVisibility('public')}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-800 font-medium text-sm">전체공개</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={visibility === 'private'}
                    onChange={() => setVisibility('private')}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <Lock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-800 font-medium text-sm">비공개</span>
                </label>
              </div>
            </div>

            {/* 본문 내용 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="content" className="block font-bold text-gray-800 text-xs sm:text-sm">
                  본문 내용 <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-gray-400">
                  {content.length}자 입력됨
                </span>
              </div>
              <textarea
                id="content"
                rows={9}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="독도 관련 활동 내용이나 역사 기록을 상세히 작성해주세요."
                required
                className="w-full px-3.5 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400 text-sm resize-y leading-relaxed"
              />
            </div>

            {/* ✨ AI 팩트체크 실행 패널 */}
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-purple-900 text-xs sm:text-sm">
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                  실시간 AI 역사 왜곡 팩트체크
                </div>
                <p className="text-[11px] sm:text-xs text-purple-700">
                  작성된 본문을 분석하여 왜곡된 표현(예: 다케시마, 일본해 등)을 점검하고 교정합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRunAiCheck}
                disabled={aiChecking || !content.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 cursor-pointer shrink-0"
              >
                {aiChecking ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    분석 진행 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    역사 왜곡 검사 실행
                  </>
                )}
              </button>
            </div>

            {/* AI Result Banner (If analyzed) */}
            {aiResult && (
              <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200 space-y-3.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-blue-950 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    AI 역사 왜곡 분석 결과
                  </h3>
                  <button
                    type="button"
                    onClick={handleApplyCorrection}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition active:scale-95"
                  >
                    본문에 교정본 적용
                  </button>
                </div>

                {aiResult.issues && aiResult.issues.length > 0 ? (
                  <div className="space-y-2">
                    {aiResult.issues.map((issue, idx) => (
                      <div key={idx} className="bg-white/90 border border-amber-200 rounded-lg p-2.5 text-xs">
                        <span className="font-bold text-amber-900">감지된 왜곡 표현: </span>
                        <span className="text-red-600 font-semibold">{issue.original}</span>
                        <p className="text-gray-600 mt-1">{issue.reason}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-700 font-medium">
                    ✓ 본문에서 역사적 왜곡 표현이 발견되지 않았습니다. 올바른 역사적 서술입니다!
                  </p>
                )}

                <div className="bg-white/95 rounded-lg p-3 border border-blue-100 space-y-1">
                  <span className="text-xs font-bold text-gray-700">추천 정정 교정본:</span>
                  <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {aiResult.correctedContent}
                  </p>
                </div>
              </div>
            )}

            {/* 첨부파일 */}
            <div className="space-y-2 pt-1">
              <label className="block font-bold text-gray-800 text-xs sm:text-sm">
                첨부파일
              </label>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl cursor-pointer shadow-sm transition active:scale-95">
                    <Upload className="w-3.5 h-3.5 text-gray-600" />
                    파일 선택
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-gray-500">
                    사진 최대 20MB (JPG/PNG/GIF), 동영상 최대 100MB (MP4/WebM)
                  </span>
                </div>

                {/* File list */}
                {files.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                      >
                        <span className="truncate max-w-xs text-gray-800 font-medium">
                          {file.name} <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                          aria-label="삭제"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400">선택된 첨부파일이 없습니다.</div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/archive')}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition active:scale-95"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting || !title.trim() || !content.trim()}
                className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {submitting ? '등록 중...' : '등록하기'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
