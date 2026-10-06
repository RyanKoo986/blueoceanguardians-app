import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, FileText, Bell, Plus, X, Trash2, Lock, Globe, Upload, Sparkles, Edit2, MessageSquare, Send, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CursorGlow } from '../home/components/CursorGlow';
import Aurora from '../home/components/Aurora';

import { archiveService, type ArchivePost, type CreatePostData } from '../../services/archiveService';
import { aiService } from '../../services/aiService';
import { MAX_IMAGE_SOURCE_BYTES, MAX_UPLOAD_BYTES, failedUploadMessage } from '../../lib/storageUpload';

type TabType = 'notice' | 'dokdo' | 'cleanup';

export default function ArchivePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>(
    (searchParams.get('tab') as TabType) || 'notice'
  );

  useEffect(() => {
    const tab = searchParams.get('tab') as TabType;
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const [posts, setPosts] = useState<ArchivePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState<ArchivePost | null>(null);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [createdPost, setCreatedPost] = useState<ArchivePost | null>(null);
  const [writeForm, setWriteForm] = useState<CreatePostData>({
    title: '',
    content: '',
    authorId: user?.id || '',
    authorName: user?.name || user?.id || '',
    visibility: 'public',
    files: []
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const ITEMS_PER_PAGE = 15;
  const PAGE_GROUP_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  // AI Fact Check State
  interface FactCheckResult {
    issues: { original: string; reason: string }[];
    correctedContent: string;
  }
  const [factCheckResult, setFactCheckResult] = useState<FactCheckResult | null>(null);
  const [showFactCheckModal, setShowFactCheckModal] = useState(false);

  // Comment State
  const [commentContent, setCommentContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN' || user?.id === 'admin';

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'notice' || tab === 'dokdo' || tab === 'cleanup') {
      setActiveTab(tab as TabType);
    }
  }, [searchParams]);

  useEffect(() => {
    loadPosts();
    setCurrentPage(1);
  }, [activeTab, user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await archiveService.getPosts(
        activeTab,
        user?.id,
        isAdmin
      );
      setPosts(data);
    } catch (error) {
      console.error('게시글 로드 실패:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadPosts();
      return;
    }

    try {
      setLoading(true);
      const data = await archiveService.searchPosts(
        activeTab,
        searchTerm,
        user?.id,
        isAdmin
      );
      setPosts(data);
    } catch (error) {
      console.error('검색 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = async (post: ArchivePost) => {
    try {
      const postDetail = await archiveService.getPost(
        activeTab,
        post.id,
        user?.id,
        isAdmin
      );
      setSelectedPost(postDetail);
    } catch (error: any) {
      alert(error.message || '게시글을 불러오는데 실패했습니다.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);

    // 모든 탭에서 이미지/영상 업로드 허용 (이미지 원본 20MB → 업로드 시 자동 압축, 영상 50MB)
    const validFiles = selectedFiles.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (isImage) return file.size <= MAX_IMAGE_SOURCE_BYTES;
      if (isVideo) return file.size <= MAX_UPLOAD_BYTES;
      return false;
    });

    if (validFiles.length !== selectedFiles.length) {
      alert('이미지(JPG, PNG, GIF 등, 최대 20MB) 또는 동영상(MP4, WebM 등, 최대 50MB)만 업로드 가능합니다.');
    }

    setWriteForm({
      ...writeForm,
      files: [...(writeForm.files || []), ...validFiles]
    });
  };

  const handleRemoveFile = (index: number) => {
    setWriteForm({
      ...writeForm,
      files: writeForm.files?.filter((_, i) => i !== index) || []
    });
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await archiveService.deletePost(activeTab, postId, user?.id || '');
      loadPosts();
      if (selectedPost?.id === postId) {
        setSelectedPost(null);
      }
      alert('게시글이 삭제되었습니다.');
    } catch (error: any) {
      alert(error.message || '게시글 삭제에 실패했습니다.');
    }
  };

  const handleEdit = (post: ArchivePost) => {
    setWriteForm({
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      authorName: post.authorName,
      visibility: post.visibility,
      category: post.category,
      files: []
    });
    setEditingPostId(post.id);
    setSelectedPost(null);
    setShowWriteModal(true);
  };

  const handleSubmit = async () => {
    if (!writeForm.title.trim() || !writeForm.content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      if (editingPostId) {
        const { failedFiles } = await archiveService.updatePost(activeTab, editingPostId, {
          title: writeForm.title.trim(),
          content: writeForm.content.trim(),
          visibility: writeForm.visibility,
          category: writeForm.category,
          files: writeForm.files,
        });
        alert(failedFiles.length ? `게시글이 수정되었습니다.

${failedUploadMessage(failedFiles)}` : '게시글이 수정되었습니다.');
      } else {
        const { post: result, failedFiles } = await archiveService.createPost(activeTab, {
          ...writeForm,
          authorId: user?.id || '',
          authorName: (user as any)?.nickname || user?.name || user?.id || '가디언즈 회원'
        });
        if (failedFiles.length) alert(failedUploadMessage(failedFiles));
        setCreatedPost(result);
        setShowShareModal(true);
      }
      
      setShowWriteModal(false);
      setEditingPostId(null);
      setWriteForm({
        title: '',
        content: '',
        authorId: user?.id || '',
        authorName: (user as any)?.nickname || user?.name || user?.id || '',
        visibility: 'public',
        files: []
      });
      await loadPosts();
    } catch (error: any) {
      console.error('❌ 게시글 저장 실패:', error);
      alert(error.message || '게시글 저장에 실패했습니다.');
    }
  };

  const handleAddComment = async () => {
    if (!selectedPost || !commentContent.trim() || !user) return;
    try {
      const newComment = await archiveService.addComment(activeTab, selectedPost.id, {
        authorId: user.id,
        authorName: (user as any)?.nickname || user.name || user.id,
        content: commentContent
      });
      
      setSelectedPost(prev => prev ? {
        ...prev,
        comments: [...(prev.comments || []), newComment]
      } : null);
      setCommentContent('');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!selectedPost || !editCommentContent.trim() || !user) return;
    try {
      const updatedComment = await archiveService.updateComment(activeTab, selectedPost.id, commentId, {
        authorId: user.id,
        content: editCommentContent
      });

      setSelectedPost(prev => prev ? {
        ...prev,
        comments: prev.comments?.map(c => c.id === commentId ? updatedComment : c)
      } : null);
      setEditingCommentId(null);
      setEditCommentContent('');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedPost || !user || !confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await archiveService.deleteComment(activeTab, selectedPost.id, commentId, user.id);
      setSelectedPost(prev => prev ? {
        ...prev,
        comments: prev.comments?.filter(c => c.id !== commentId)
      } : null);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleShare = (platform: 'x' | 'threads') => {
    if (!createdPost) return;
    const url = window.location.href;
    const text = `[독도 자료실] ${createdPost.title}`;
    let shareUrl = '';
    if (platform === 'x') {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    } else if (platform === 'threads') {
      shareUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    }
    window.open(shareUrl, '_blank');
  };

  const handleAIGenerate = async (type: 'refine' | 'expand' | 'summarize' | 'fact-check') => {
    if (!writeForm.content.trim()) {
      alert('글 내용을 먼저 입력해주세요.');
      return;
    }
    try {
      setIsGenerating(true);
      if (type === 'fact-check') {
        const factCheckRes = await aiService.factCheck(writeForm.content);
        setFactCheckResult({
          issues: factCheckRes.issues,
          correctedContent: factCheckRes.correctedContent,
        });
        setShowFactCheckModal(true);
      } else {
        const refined = await aiService.refineText(writeForm.content, type);
        setWriteForm(prev => ({ ...prev, content: refined }));
      }
    } catch (error: any) {
      console.error('AI 생성 에러:', error);
      alert(error.message || 'AI 처리 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyCorrection = () => {
    if (factCheckResult) {
      setWriteForm(prev => ({ ...prev, content: factCheckResult.correctedContent }));
      setShowFactCheckModal(false);
      setFactCheckResult(null);
    }
  };

  // 공지사항은 admin만 작성 가능, 나머지(독도 자료, 수중 정화 활동)는 로그인 사용자 누구나 작성 가능
  const canWrite = activeTab === 'notice' ? isAdmin : isAuthenticated;

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const indexOfLastPost = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - ITEMS_PER_PAGE;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);

  const currentGroup = Math.ceil(currentPage / PAGE_GROUP_SIZE);
  const startPage = (currentGroup - 1) * PAGE_GROUP_SIZE + 1;
  const endPage = Math.min(startPage + PAGE_GROUP_SIZE - 1, totalPages);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevGroup = () => {
    if (startPage > 1) setCurrentPage(startPage - 1);
  };

  const handleNextGroup = () => {
    if (endPage < totalPages) setCurrentPage(endPage + 1);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\./g, '.').replace(/\s/g, '');
  };

  const isPostEdited = (createdAt?: string, updatedAt?: string) => {
    if (!createdAt || !updatedAt) return false;
    const createdTime = new Date(createdAt).getTime();
    const updatedTime = new Date(updatedAt).getTime();
    if (isNaN(createdTime) || isNaN(updatedTime)) return false;
    return updatedTime - createdTime > 60 * 1000;
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Helmet>
        <title>자료실 - Blue Guardians</title>
        <meta name="description" content="독도 관련 학생 자료, 공지사항, 독도 사진 및 영상 자료를 제공합니다." />
      </Helmet>
       <CursorGlow />
       <div className="fixed inset-0 z-0">
        <Aurora 
          colorStops={['#0ea5e9', '#1e40af', '#0c4a6e']}
          amplitude={1.2}
          blend={0.6}
          speed={0.8}
        />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden pt-20">
          <div className="absolute inset-0 z-0">
            <img
                src={
                  activeTab === 'notice' ? "/images/dokdo photo/IMG_20250614_102346_101.jpeg" :
                  activeTab === 'dokdo' ? "/images/dokdo photo/KakaoTalk_20250615_073514603_01.jpg" :
                  "/images/dokdo photo/KakaoTalk_20250615_182418407.jpg"
                }
                alt="Dokdo Archive Background"
                className="w-full h-full object-cover"
                key={activeTab}
            />
          </div>
          <div className="absolute inset-0 bg-black/40 z-10" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-wider">
              {activeTab === 'notice' ? '공지사항' : activeTab === 'dokdo' ? '독도 자료' : '수중 정화 활동'}
            </h1>
            <p className="text-lg text-gray-200 tracking-wide font-light">
               {activeTab === 'notice'
                 ? '독도 자료실의 새로운 소식을 확인하세요'
                 : activeTab === 'dokdo'
                 ? '대한민국의 아름다운 영토, 독도의 사진과 영상 자료'
                 : '독도 수중 환경을 지키는 정화 활동 기록'}
            </p>
          </div>
        </section>

        {/* Archive Content Section - White Background */}
        <section className="bg-white min-h-screen py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Tab Navigation - Modern Segmented Control */}
            <div className="max-w-xl mx-auto mb-8 sm:mb-10">
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-gray-200/80 shadow-inner">
                {[
                  { id: 'notice', label: '공지사항', icon: Bell },
                  { id: 'dokdo', label: '독도 자료', icon: Camera },
                  { id: 'cleanup', label: '수중 정화 활동', icon: Sparkles }
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id as TabType);
                        setSearchParams({ tab: tab.id });
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 select-none active:scale-95 ${
                        isActive
                          ? 'bg-white text-blue-600 shadow-sm font-bold'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className="whitespace-nowrap">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Controls Row: Search & Write & Category */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
              
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <span className="text-gray-600 text-xs sm:text-sm font-medium">
                  총 <span className="text-blue-600 font-bold">{filteredPosts.length}</span>건
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Search Box */}
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all flex-1 sm:w-72">
                  <input
                    type="text"
                    placeholder="검색어를 입력하세요"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 px-3.5 py-2 bg-transparent text-gray-800 outline-none text-xs sm:text-sm placeholder-gray-400"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-3 py-2 text-gray-400 hover:text-blue-600 transition-colors"
                    aria-label="검색"
                  >
                    <Search size={16} />
                  </button>
                </div>

                {/* Write Button */}
                {canWrite && (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                         alert('로그인이 필요합니다.');
                         navigate('/login');
                         return;
                      }
                      setEditingPostId(null);
                      setWriteForm({
                         title: '',
                         content: '',
                         authorId: user?.id || '',
                         authorName: (user as any)?.nickname || user?.id || '',
                         visibility: 'public',
                         files: []
                      });
                      setShowWriteModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition shadow-sm flex items-center gap-1.5 whitespace-nowrap active:scale-95"
                  >
                    <Plus size={16} />
                    <span>글쓰기</span>
                  </button>
                )}
              </div>
            </div>

            {/* Content Display */}
            <div className="min-h-[400px]">
              {loading ? (
                <div className="text-center py-20 text-gray-500 border-t border-b border-gray-200">
                  데이터를 불러오는 중입니다...
                </div>
              ) : (
                <>
                  {(activeTab === 'dokdo' || activeTab === 'cleanup') ? (
                    /* Gallery Grid View */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                       {currentPosts.map((post) => (
                         <div
                           key={post.id}
                           onClick={() => handlePostClick(post)}
                           className="group cursor-pointer bg-white border border-gray-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg"
                         >
                           <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                              {post.files && post.files.length > 0 ? (
                                post.files[0].url.match(/\.(mp4|webm|mov|avi)$/i) ? (
                                  <video
                                    src={post.files[0].url}
                                    className="w-full h-full object-cover"
                                    muted
                                  />
                                ) : (
                                  <img
                                    src={post.files[0].url}
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                )
                              ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50">
                                   <span className="text-sm">이미지 없음</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                           </div>
                           <div className="p-5">
                             <h3 className="text-gray-900 font-bold text-lg mb-2 truncate group-hover:text-blue-600">
                               {post.title}
                             </h3>
                             <div className="flex justify-between items-center text-sm text-gray-500 border-t border-gray-100 pt-3">
                               <span>{post.authorName}</span>
                               <span className="text-gray-400">{formatDate(post.createdAt)}</span>
                             </div>
                           </div>
                         </div>
                       ))}
                       {currentPosts.length === 0 && (
                          <div className="col-span-full text-center py-20 text-gray-500 border border-gray-200 bg-gray-50">
                             등록된 게시물이 없습니다.
                          </div>
                       )}
                    </div>
                  ) : (
                    /* Table List View (Notice & Student) */
                    <div className="border-t-2 border-blue-600 overflow-x-auto">
                       <table className="w-full text-sm text-left">
                         <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                           <tr>
                              <th className="px-3 py-3 sm:px-6 sm:py-4 text-center w-12 sm:w-20 text-xs sm:text-sm">번호</th>
                              <th className="px-3 py-3 sm:px-6 sm:py-4 text-left sm:text-center text-xs sm:text-sm">제목</th>
                              <th className="px-6 py-4 text-center w-32 hidden md:table-cell">작성자</th>
                              <th className="px-6 py-4 text-center w-32 hidden md:table-cell">첨부</th>
                              <th className="px-3 py-3 sm:px-6 sm:py-4 text-center w-24 sm:w-32 text-xs sm:text-sm">등록일</th>
                              <th className="px-6 py-4 text-center w-20 hidden sm:table-cell">조회</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-200 bg-white">
                           {currentPosts.map((post, index) => (
                             <tr 
                               key={post.id}
                               onClick={() => handlePostClick(post)}
                               className="hover:bg-gray-50 cursor-pointer transition-colors"
                             >
                               <td className="px-3 py-3 sm:px-6 sm:py-4 text-center text-gray-500 text-xs sm:text-sm">
                                 {filteredPosts.length - ((currentPage - 1) * ITEMS_PER_PAGE + index)}
                               </td>
                               <td className="px-3 py-3 sm:px-6 sm:py-4">
                                 <div className="flex items-center gap-1.5 sm:gap-2">
                                    {post.visibility === 'private' && <Lock size={14} className="text-gray-400 shrink-0" />}
                                    <span className="text-gray-900 font-medium hover:text-blue-600 transition-colors line-clamp-1 text-xs sm:text-sm">
                                      {post.title}
                                    </span>
                                    {post.comments && post.comments.length > 0 && (
                                      <span className="text-blue-500 text-xs font-bold shrink-0">[{post.comments.length}]</span>
                                    )}
                                 </div>
                               </td>
                               <td className="px-6 py-4 text-center text-gray-600 hidden md:table-cell">
                                 {post.authorName}
                               </td>
                               <td className="px-6 py-4 text-center hidden md:table-cell">
                                  {post.files && post.files.length > 0 ? (
                                    <Upload size={16} className="text-gray-400 mx-auto" />
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  )}
                               </td>
                               <td className="px-3 py-3 sm:px-6 sm:py-4 text-center text-gray-500 text-xs sm:text-sm whitespace-nowrap">
                                 {formatDate(post.createdAt)}
                               </td>
                               <td className="px-6 py-4 text-center text-gray-500 hidden sm:table-cell text-xs sm:text-sm">
                                 {post.views}
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                       {currentPosts.length === 0 && (
                          <div className="text-center py-20 text-gray-500 border-b border-gray-200">
                             등록된 게시물이 없습니다.
                          </div>
                       )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Pagination - White Style */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12 gap-1">
                 <button 
                  onClick={handlePrevGroup}
                  disabled={startPage === 1}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} className="rotate-180" />
                </button>
                {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 flex items-center justify-center border ${
                      currentPage === pageNum
                        ? 'border-blue-600 bg-blue-600 text-white font-bold'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button 
                  onClick={handleNextGroup}
                  disabled={endPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
            
          </div>
        </section>
        

      </div>

      {/* Write / Edit Modal */}
      <AnimatePresence>
        {showWriteModal && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowWriteModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-y-auto border border-gray-200"
              style={{ maxHeight: '85dvh', overscrollBehavior: 'contain' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-5 sm:px-6 py-4 flex justify-between items-center sticky top-0 z-10 text-white shadow-sm">
                <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 tracking-wide">
                  <Edit2 size={18} className="text-cyan-300" />
                  {editingPostId ? '게시글 수정' : activeTab === 'dokdo' ? '독도 자료 등록' : activeTab === 'cleanup' ? '수중 정화 활동 기록 등록' : '공지사항 작성'}
                </h2>
                <button
                  onClick={() => setShowWriteModal(false)}
                  className="text-white/80 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10 active:scale-90"
                  aria-label="닫기"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Modal Form Body */}
              <div className="p-5 sm:p-7 space-y-5 text-sm">
                
                {/* 제목 */}
                <div className="space-y-1.5">
                  <label htmlFor="modal-title" className="block font-bold text-gray-800 text-xs sm:text-sm">
                    제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="modal-title"
                    type="text"
                    value={writeForm.title}
                    onChange={(e) => setWriteForm({ ...writeForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400 text-sm"
                    placeholder="게시글 제목을 입력하세요"
                  />
                </div>

                {/* 작성자 & 공개 설정 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="block font-bold text-gray-800 text-xs sm:text-sm">
                      작성자
                    </span>
                    <div className="px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 text-sm font-medium">
                      {(user as any)?.nickname || user?.name || user?.id || '독도 가디언'}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="block font-bold text-gray-800 text-xs sm:text-sm">
                      공개 설정
                    </span>
                    <div className="flex items-center gap-6 pt-2">
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="modal-visibility"
                          value="public"
                          checked={writeForm.visibility === 'public'}
                          onChange={(e) => setWriteForm({ ...writeForm, visibility: e.target.value as 'public' | 'private' })}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <Globe size={15} className="text-blue-600" />
                        <span className="text-gray-800 font-medium text-xs sm:text-sm">전체공개</span>
                      </label>

                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="modal-visibility"
                          value="private"
                          checked={writeForm.visibility === 'private'}
                          onChange={(e) => setWriteForm({ ...writeForm, visibility: e.target.value as 'public' | 'private' })}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <Lock size={15} className="text-gray-500" />
                        <span className="text-gray-800 font-medium text-xs sm:text-sm">비공개</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 본문 내용 */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="modal-content" className="block font-bold text-gray-800 text-xs sm:text-sm">
                      본문 내용 <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-gray-400">
                      {writeForm.content.length}자 입력됨
                    </span>
                  </div>
                  <textarea
                    id="modal-content"
                    rows={8}
                    value={writeForm.content}
                    onChange={(e) => setWriteForm({ ...writeForm, content: e.target.value })}
                    className="w-full px-3.5 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400 text-sm resize-y leading-relaxed"
                    placeholder="내용을 상세히 작성해주세요."
                  />
                </div>

                {/* ✨ 실시간 AI 팩트체크 검사 버튼 바 */}
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
                    onClick={() => handleAIGenerate('fact-check')}
                    disabled={isGenerating}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-60"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
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

                {/* 첨부파일 */}
                <div className="space-y-2 pt-1">
                  <label className="block font-bold text-gray-800 text-xs sm:text-sm">
                    첨부파일
                  </label>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl cursor-pointer shadow-sm transition active:scale-95">
                        <Upload size={14} className="text-gray-600" />
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
                        사진 최대 20MB (JPG/PNG/GIF, 자동 압축), 동영상 최대 50MB (MP4/WebM)
                      </span>
                    </div>

                    {/* File list */}
                    {writeForm.files && writeForm.files.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        {writeForm.files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                          >
                            <span className="truncate max-w-xs text-gray-800 font-medium">
                              {file.name} <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(index)}
                              className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                              aria-label="삭제"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">선택된 첨부파일이 없습니다.</div>
                    )}
                  </div>
                </div>

                {/* Modal Action Buttons */}
                <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowWriteModal(false)}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition active:scale-95"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send size={15} />
                    {editingPostId ? '수정 완료' : '등록하기'}
                  </button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post Detail Modal - Public Institution Style */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-y-auto"
              style={{ maxHeight: '85dvh', overscrollBehavior: 'contain' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header Bar */}
              <div className="bg-blue-900 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-md">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                   <FileText size={20} />
                   게시글 상세
                </h2>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-white/80 hover:text-white transition-colors p-1"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-4 sm:p-6 md:p-10">
                {/* Board View Container */}
                <div className="border-t-2 border-slate-800 border-b border-gray-200">
                  
                  {/* Title Area */}
                  <div className="bg-gray-50 px-4 sm:px-6 py-3.5 sm:py-5 border-b border-gray-200 flex items-start justify-between gap-3">
                    <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-snug">
                       {selectedPost.title}
                    </h1>
                    {selectedPost.visibility === 'private' ? (
                       <span className="shrink-0 flex items-center gap-1 text-gray-500 text-xs border border-gray-300 rounded px-2 py-0.5 bg-white font-medium">
                          <Lock size={12} /> 비공개
                       </span>
                    ) : (
                       <span className="shrink-0 flex items-center gap-1 text-blue-600 text-xs border border-blue-200 rounded px-2 py-0.5 bg-blue-50 font-medium">
                          <Globe size={12} /> 전체공개
                       </span>
                    )}
                  </div>

                  {/* Info Row: 2x2 Balanced Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 border-b border-gray-200 text-xs sm:text-sm">
                     {/* Row 1, Col 1: 작성자 */}
                     <div className="flex items-center border-b md:border-b-0 border-r border-gray-200">
                        <span className="w-16 sm:w-20 bg-gray-50 py-2.5 sm:py-3 text-center font-bold text-gray-600 border-r border-gray-200 shrink-0">
                          작성자
                        </span>
                        <span className="px-3 sm:px-4 py-2.5 sm:py-3 text-gray-800 truncate font-medium">
                           {selectedPost.authorName}
                        </span>
                     </div>

                     {/* Row 1, Col 2: 등록일 */}
                     <div className="flex items-center border-b md:border-b-0 md:border-r border-gray-200">
                        <span className="w-16 sm:w-20 bg-gray-50 py-2.5 sm:py-3 text-center font-bold text-gray-600 border-r border-gray-200 shrink-0">
                          등록일
                        </span>
                        <span className="px-3 sm:px-4 py-2.5 sm:py-3 text-gray-600 whitespace-nowrap">
                           {formatDate(selectedPost.createdAt)}
                        </span>
                     </div>

                     {/* Row 2, Col 1: 조회수 */}
                     <div className="flex items-center border-r border-gray-200">
                        <span className="w-16 sm:w-20 bg-gray-50 py-2.5 sm:py-3 text-center font-bold text-gray-600 border-r border-gray-200 shrink-0">
                          조회수
                        </span>
                        <span className="px-3 sm:px-4 py-2.5 sm:py-3 text-gray-600">
                           {selectedPost.views.toLocaleString()}
                        </span>
                     </div>

                     {/* Row 2, Col 2: 수정일 (등록일 바로 아래 정렬) */}
                     <div className="flex items-center">
                        <span className="w-16 sm:w-20 bg-gray-50 py-2.5 sm:py-3 text-center font-bold text-gray-600 border-r border-gray-200 shrink-0">
                          수정일
                        </span>
                        <span className="px-3 sm:px-4 py-2.5 sm:py-3 text-gray-600 whitespace-nowrap">
                           {isPostEdited(selectedPost.createdAt, selectedPost.updatedAt)
                             ? formatDate(selectedPost.updatedAt)
                             : '-'}
                        </span>
                     </div>
                  </div>

                  {/* Attachment Row */}
                  {selectedPost.files && selectedPost.files.length > 0 && (
                    <div className="flex border-b border-gray-200">
                       <div className="w-16 sm:w-20 md:w-[85px] bg-gray-50 py-3 flex items-center justify-center font-bold text-gray-600 border-r border-gray-200 shrink-0 text-xs sm:text-sm">
                          첨부
                       </div>
                       <div className="p-2.5 sm:p-3 flex flex-wrap gap-2">
                          {selectedPost.files.map((file, index) => (
                             <a
                                key={index}
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-xs sm:text-sm text-gray-700 transition-colors"
                             >
                                <Upload size={13} className="text-gray-400" />
                                <span className="truncate max-w-[150px] sm:max-w-[200px]">{file.name}</span>
                                <span className="text-gray-400 text-[11px] sm:text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
                             </a>
                          ))}
                       </div>
                    </div>
                  )}

                  {/* Content Area */}
                  <div className="p-4 sm:p-8 min-h-[200px] sm:min-h-[300px] bg-white text-gray-800 leading-7 sm:leading-8 whitespace-pre-wrap text-sm sm:text-base">
                     {selectedPost.content}
                     
                     {/* Inline Images/Videos */}
                     {selectedPost.files && selectedPost.files.length > 0 && (
                        <div className="mt-8 grid grid-cols-1 gap-6 max-w-3xl mx-auto">
                           {selectedPost.files.map((file, index) => (
                              <div key={index} className="rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                                 {file.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                    <img src={file.url} alt={file.name} className="w-full h-auto" />
                                 ) : file.url.match(/\.(mp4|webm|mov|avi)$/i) ? (
                                    <video src={file.url} controls className="w-full h-auto" />
                                 ) : null}
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
                   <button
                     onClick={() => setSelectedPost(null)}
                     className="px-5 py-2 border border-gray-300 bg-white text-gray-600 rounded hover:bg-gray-50 transition-colors font-medium text-sm"
                   >
                     목록으로
                   </button>
                   
                   <div className="flex gap-2">
                      {(selectedPost.authorId === user?.id || isAdmin) && (
                       <button
                         onClick={() => handleEdit(selectedPost)}
                         className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors font-medium text-sm"
                       >
                         <Edit2 size={16} /> 수정
                       </button>
                     )}
                     {(selectedPost.authorId === user?.id || isAdmin) && (
                       <button
                         onClick={() => handleDelete(selectedPost.id)}
                         className="flex items-center gap-1 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded hover:bg-red-100 transition-colors font-medium text-sm"
                       >
                         <Trash2 size={16} /> 삭제
                       </button>
                     )}
                   </div>
                </div>

                {/* Comments Section */}
                <div className="mt-10 bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2 text-lg">
                    <MessageSquare size={20} className="text-blue-600" />
                    댓글 <span className="text-blue-600">{selectedPost.comments?.length || 0}</span>
                  </h3>

                  {/* Comment List */}
                  <div className="space-y-3 mb-6">
                    {selectedPost.comments?.map((comment) => (
                      <div key={comment.id} className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 font-bold">{comment.authorName}</span>
                            <span className="text-gray-400 text-xs border-l border-gray-300 pl-2">{formatDate(comment.createdAt)}</span>
                          </div>
                          {(comment.authorId === user?.id || isAdmin) && (
                            <div className="flex gap-2">
                              {comment.authorId === user?.id && (
                                <button
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditCommentContent(comment.content);
                                  }}
                                  className="text-gray-400 hover:text-blue-600 text-xs underline"
                                >
                                  수정
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-gray-400 hover:text-red-500 text-xs underline"
                              >
                                삭제
                              </button>
                            </div>
                          )}
                        </div>
                        {editingCommentId === comment.id ? (
                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              value={editCommentContent}
                              onChange={(e) => setEditCommentContent(e.target.value)}
                              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-blue-500"
                            />
                            <button
                              onClick={() => handleUpdateComment(comment.id)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                            >
                              완료
                            </button>
                            <button
                              onClick={() => setEditingCommentId(null)}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                        )}
                      </div>
                    ))}
                    {(!selectedPost.comments || selectedPost.comments.length === 0) && (
                       <div className="text-center py-8 text-gray-400 text-sm">
                          첫 번째 댓글을 작성해보세요.
                       </div>
                    )}
                  </div>

                  {/* Add Comment */}
                  {isAuthenticated ? (
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                         <input
                           type="text"
                           value={commentContent}
                           onChange={(e) => setCommentContent(e.target.value)}
                           placeholder="댓글을 작성하여 의견을 공유해보세요."
                           className="w-full bg-white border border-gray-300 rounded-lg pl-4 pr-12 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                           onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                         />
                         <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                           <MessageSquare size={16} />
                         </div>
                      </div>
                      <button
                        onClick={handleAddComment}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-sm text-sm"
                      >
                        등록
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500 text-sm border border-gray-200">
                       댓글을 작성하려면 <Link to="/login" className="text-blue-600 font-bold hover:underline">로그인</Link>이 필요합니다.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Fact Check Result Modal */}
      <AnimatePresence>
        {showFactCheckModal && factCheckResult && (
           <motion.div
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFactCheckModal(false)}
          >
            <motion.div
              className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-2xl overflow-y-auto shadow-2xl p-6 sm:p-7"
              style={{ maxHeight: '85dvh', overscrollBehavior: 'contain' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                AI 팩트체크 검증 결과
              </h2>

              {factCheckResult.issues && factCheckResult.issues.length > 0 ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {factCheckResult.issues.map((issue, idx) => (
                      <div key={idx} className="bg-slate-800/80 border border-red-500/30 rounded-xl p-3 text-xs">
                        <span className="font-bold text-red-400">감지된 왜곡 표현: </span>
                        <span className="text-red-300 font-semibold">{issue.original}</span>
                        <p className="text-gray-300 mt-1">{issue.reason}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-800 border border-white/10 rounded-xl p-3.5 space-y-1">
                    <span className="text-xs font-bold text-cyan-300">추천 교정본:</span>
                    <p className="text-xs text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {factCheckResult.correctedContent}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 space-y-1">
                  <p className="font-bold">✓ 역사 왜곡 및 사실 오류가 발견되지 않았습니다.</p>
                  <p className="text-emerald-400/80 text-[11px] leading-relaxed">
                    작성하신 본문은 역사적 사실에 부합하며 왜곡 표현이 없어 교정 없이 그대로 등록하실 수 있습니다.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowFactCheckModal(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  닫기
                </button>
                {factCheckResult.issues && factCheckResult.issues.length > 0 && (
                  <button
                    type="button"
                    onClick={applyCorrection}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-md"
                  >
                    본문에 교정본 적용
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
          {showShareModal && (
            <motion.div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={() => setShowShareModal(false)}>
               <div className="bg-slate-900 p-8 rounded-2xl border border-white/20" onClick={e => e.stopPropagation()}>
                  <h2 className="text-2xl text-white font-bold mb-4">작성 완료!</h2>
                  <div className="flex gap-4">
                     <button onClick={() => handleShare('x')} className="text-white">X (Twitter)</button>
                     <button onClick={() => handleShare('threads')} className="text-white">Threads</button>
                  </div>
                  <button onClick={() => setShowShareModal(false)} className="mt-6 w-full py-2 bg-white/10 text-white rounded">닫기</button>
               </div>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
