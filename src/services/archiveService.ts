import { supabase, isSupabaseConfigured, STORAGE_BUCKET } from '../lib/supabase';

export interface ArchiveFile {
  name: string;
  filename: string;
  size: number;
  url: string;
}

export interface ArchiveComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArchivePost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  visibility: 'public' | 'private';
  views: number;
  createdAt: string;
  updatedAt: string;
  files?: ArchiveFile[];
  category?: string;
  boardType?: string;
  isImportant?: boolean;
  comments?: ArchiveComment[];
}

export interface CreatePostData {
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  visibility: 'public' | 'private';
  category?: string;
  files?: File[];
}

const LOCAL_STORAGE_KEY = 'dokdo_archive_posts_v2';

const getLocalPosts = (): ArchivePost[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [
    {
      id: 'demo-notice-1',
      title: '제4회 독도 바다정화 및 플로깅 자원봉사자 모집 안내',
      content: '깨끗한 독도 바다를 만들기 위한 2026년 봄맞이 해양 정화 캠페인이 시작됩니다. 많은 가디언즈 여러분의 참여를 기다립니다.',
      authorId: 'admin',
      authorName: '관리자',
      boardType: 'notice',
      visibility: 'public',
      views: 389,
      category: '공지사항',
      isImportant: true,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      files: [],
      comments: [],
    },
    {
      id: 'demo-notice-2',
      title: '2026 전국 독도 수중사진 공모전 출품 요강 안내',
      content: '사단법인 대한잠수협회가 주관하는 2026 전국 독도 수중사진 공모전 출품 요강 및 작품 접수 안내 공지입니다.',
      authorId: 'admin',
      authorName: '관리자',
      boardType: 'notice',
      visibility: 'public',
      views: 215,
      category: '공지사항',
      isImportant: false,
      createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
      files: [],
      comments: [],
    },
    {
      id: 'demo-dokdo-1',
      title: '2026년 상반기 독도 연안 해양생태계 종합 모니터링 결과 보고',
      content: '독도 주변 해역의 수온 변화 및 아열대성 어종 출현 빈도에 대한 정밀 조사 결과 보고서입니다. 해조류 서식 환경 개선을 위한 지속적인 보전 활동이 필요합니다.',
      authorId: 'researcher-1',
      authorName: '김해양 연구원',
      boardType: 'dokdo',
      visibility: 'public',
      views: 142,
      category: '생태계 조사',
      isImportant: true,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      files: [
        {
          name: 'dokdo-aerial.jpg',
          filename: 'dokdo-aerial.jpg',
          size: 1024 * 450,
          url: '/images/dokdo photo/IMG_20250614_102346_101.jpeg',
        }
      ],
      comments: [],
    },
    {
      id: 'demo-dokdo-2',
      title: '아름다운 독도의 동도와 서도 절경 사진 자료',
      content: '푸른 동해 바다 위에 솟아 있는 독도의 웅장한 사계절 풍경을 렌즈에 담은 고화질 아카이브 자료입니다.',
      authorId: 'user-1',
      authorName: '독도 가디언',
      boardType: 'dokdo',
      visibility: 'public',
      views: 98,
      category: '자료 공유',
      isImportant: false,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      files: [
        {
          name: 'dokdo-scenic.jpg',
          filename: 'dokdo-scenic.jpg',
          size: 1024 * 380,
          url: '/images/dokdo photo/KakaoTalk_20251001_214423114_12.jpg',
        }
      ],
      comments: [],
    },
    {
      id: 'demo-cleanup-1',
      title: '동도 연안 수중 폐그물 및 해양쓰레기 수거 활동 기록',
      content: '잠수협회와 함께 진행한 독도 해양 정화 활동 현장입니다. 수중 침적 쓰레기 및 폐어구 500kg을 안전하게 수거 완료했습니다.',
      authorId: 'diver-1',
      authorName: '바다지킴이',
      boardType: 'cleanup',
      visibility: 'public',
      views: 184,
      category: '정화 후기',
      isImportant: true,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      files: [
        {
          name: 'cleanup-activity.jpg',
          filename: 'cleanup-activity.jpg',
          size: 1024 * 512,
          url: '/images/dokdo photo/KakaoTalk_20250615_073514603_01.jpg',
        }
      ],
      comments: [],
    },
    {
      id: 'demo-cleanup-2',
      title: '가디언즈 2026 봄맞이 비치코밍 및 정화 봉사 후기',
      content: '독도 주변 해안가 쓰레기 수거 및 생태 보전 플로깅 봉사활동을 진행하였습니다. 동참해주신 모든 분들께 감사드립니다.',
      authorId: 'volunteer-1',
      authorName: '에코가디언',
      boardType: 'cleanup',
      visibility: 'public',
      views: 76,
      category: '봉사활동',
      isImportant: false,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      files: [
        {
          name: 'beachcombing.jpg',
          filename: 'beachcombing.jpg',
          size: 1024 * 290,
          url: '/images/dokdo photo/IMG_20250614_100730_221.jpeg',
        }
      ],
      comments: [],
    },
  ];
};

const saveLocalPosts = (posts: ArchivePost[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(posts));
};

export const archiveService = {
  async getPosts(boardType: string, userId?: string, isAdmin?: boolean): Promise<ArchivePost[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from('archive_posts')
        .select(`
          *,
          archive_files (*),
          archive_comments (*)
        `)
        .order('is_important', { ascending: false })
        .order('created_at', { ascending: false });

      if (boardType && boardType !== 'all') {
        query = query.eq('board_type', boardType);
      }

      if (!isAdmin) {
        if (userId) {
          query = query.or(`visibility.eq.public,author_id.eq.${userId}`);
        } else {
          query = query.eq('visibility', 'public');
        }
      }

      const { data, error } = await query;
      if (error) {
        throw new Error(error.message || '게시글을 불러오는데 실패했습니다.');
      }

      return (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        authorId: p.author_id,
        authorName: p.author_name,
        visibility: p.visibility,
        views: p.views || 0,
        category: p.category,
        boardType: p.board_type,
        isImportant: p.is_important,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        files: (p.archive_files || []).map((f: any) => ({
          name: f.name,
          filename: f.filename,
          size: f.size,
          url: f.url,
        })),
        comments: (p.archive_comments || []).map((c: any) => ({
          id: c.id,
          authorId: c.author_id,
          authorName: c.author_name,
          content: c.content,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        })),
      }));
    }

    const posts = getLocalPosts();
    if (boardType && boardType !== 'all') {
      return posts.filter((p) => p.boardType === boardType);
    }
    return posts;
  },

  async getPost(_boardType: string, id: string, _userId?: string, _isAdmin?: boolean): Promise<ArchivePost> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('archive_posts')
        .select(`
          *,
          archive_files (*),
          archive_comments (*)
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        throw new Error(error?.message || '게시글을 찾을 수 없습니다.');
      }

      // 조회수 증가 (방문자는 게시글 UPDATE 권한이 없으므로 RPC 사용)
      supabase.rpc('increment_post_views', { post_id: id }).then();

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        authorId: data.author_id,
        authorName: data.author_name,
        visibility: data.visibility,
        views: (data.views || 0) + 1,
        category: data.category,
        isImportant: data.is_important,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        files: (data.archive_files || []).map((f: any) => ({
          name: f.name,
          filename: f.filename,
          size: f.size,
          url: f.url,
        })),
        comments: (data.archive_comments || []).map((c: any) => ({
          id: c.id,
          authorId: c.author_id,
          authorName: c.author_name,
          content: c.content,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        })),
      };
    }

    const posts = getLocalPosts();
    const post = posts.find((p) => p.id === id);
    if (!post) throw new Error('게시글을 찾을 수 없습니다.');
    post.views = (post.views || 0) + 1;
    saveLocalPosts(posts);
    return post;
  },

  async createPost(boardType: string, data: CreatePostData): Promise<ArchivePost> {
    if (isSupabaseConfigured && supabase) {
      if (!['notice', 'dokdo', 'cleanup'].includes(boardType)) {
        throw new Error('알 수 없는 게시판입니다.');
      }

      // Guests cannot read back their own private posts, so the row is built locally
      const now = new Date().toISOString();
      const post = {
        id: crypto.randomUUID(),
        board_type: boardType,
        title: data.title,
        content: data.content,
        author_id: data.authorId.includes('-') ? data.authorId : null,
        author_name: data.authorName,
        visibility: data.visibility || 'public',
        category: data.category || '일반',
      };
      const { error } = await supabase.from('archive_posts').insert(post);

      if (error) {
        throw new Error(error.message || '게시글 작성에 실패했습니다.');
      }

      // 파일 업로드 처리
      const uploadedFiles: ArchiveFile[] = [];
      if (data.files && data.files.length > 0) {
        for (const file of data.files) {
          const filePath = `archive/${post.id}/${Date.now()}_${file.name}`;
          const { error: uploadErr } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(filePath, file);

          if (!uploadErr) {
            const { data: urlData } = supabase.storage
              .from(STORAGE_BUCKET)
              .getPublicUrl(filePath);

            const fileRecord: ArchiveFile = {
              name: file.name,
              filename: filePath,
              size: file.size,
              url: urlData.publicUrl,
            };

            await supabase.from('archive_files').insert({
              post_id: post.id,
              ...fileRecord,
            });
            uploadedFiles.push(fileRecord);
          }
        }
      }

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        authorId: post.author_id || data.authorId,
        authorName: post.author_name,
        visibility: post.visibility,
        views: 0,
        category: post.category,
        isImportant: false,
        createdAt: now,
        updatedAt: now,
        files: uploadedFiles,
        comments: [],
      };
    }

    const posts = getLocalPosts();
    const newPost: ArchivePost = {
      id: `post-${Date.now()}`,
      title: data.title,
      content: data.content,
      authorId: data.authorId,
      authorName: data.authorName,
      visibility: data.visibility,
      category: data.category || (boardType === 'notice' ? '공지사항' : boardType === 'cleanup' ? '수중정화' : '독도자료'),
      boardType: boardType || 'dokdo',
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: (data.files || []).map((f) => ({
        name: f.name,
        filename: f.name,
        size: f.size,
        url: URL.createObjectURL(f),
      })),
      comments: [],
    };
    posts.unshift(newPost);
    saveLocalPosts(posts);
    return newPost;
  },

  async updatePost(
    boardType: string,
    id: string,
    data: Partial<CreatePostData>,
  ): Promise<ArchivePost> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isSupabaseConfigured && supabase && isUuid) {
      const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (data.title !== undefined) updatePayload.title = data.title;
      if (data.content !== undefined) updatePayload.content = data.content;
      if (data.visibility !== undefined) updatePayload.visibility = data.visibility;
      if (data.category !== undefined) updatePayload.category = data.category;

      const { data: updated, error } = await supabase
        .from('archive_posts')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (!error && updated) {
        // 새 파일이 추가된 경우 업로드 처리
        if (data.files && data.files.length > 0) {
          for (const file of data.files) {
            const filePath = `archive/${id}/${Date.now()}_${file.name}`;
            const { error: uploadErr } = await supabase.storage
              .from(STORAGE_BUCKET)
              .upload(filePath, file);

            if (!uploadErr) {
              const { data: urlData } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(filePath);

              await supabase.from('archive_files').insert({
                post_id: id,
                name: file.name,
                filename: filePath,
                size: file.size,
                url: urlData.publicUrl,
              });
            }
          }
        }

        return this.getPost(boardType, id);
      }
    }

    // 로컬 글 또는 Supabase 폴백
    const posts = getLocalPosts();
    const index = posts.findIndex((p) => p.id === id);
    if (index !== -1) {
      const { files: newFiles, ...restData } = data;
      const existingFiles = posts[index].files || [];
      const addedFiles = (newFiles || []).map((f) => ({
        name: f.name,
        filename: f.name,
        size: f.size,
        url: URL.createObjectURL(f),
      }));

      posts[index] = {
        ...posts[index],
        ...restData,
        files: [...existingFiles, ...addedFiles],
        updatedAt: new Date().toISOString(),
      };
      saveLocalPosts(posts);
      return posts[index];
    }

    throw new Error('게시글을 찾을 수 없거나 수정에 실패했습니다.');
  },

  async deletePost(_boardType: string, id: string, _userId?: string): Promise<void> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isSupabaseConfigured && supabase && isUuid) {
      const { error } = await supabase.from('archive_posts').delete().eq('id', id);
      if (!error) return;
    }

    const posts = getLocalPosts().filter((p) => p.id !== id);
    saveLocalPosts(posts);
  },

  async searchPosts(
    _boardType: string,
    query: string,
    _userId?: string,
    _isAdmin?: boolean
  ): Promise<ArchivePost[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('archive_posts')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message || '검색에 실패했습니다.');
      return (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        authorId: p.author_id,
        authorName: p.author_name,
        visibility: p.visibility,
        views: p.views || 0,
        category: p.category,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));
    }

    const posts = getLocalPosts();
    const q = query.toLowerCase();
    return posts.filter((p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
  },

  async addComment(_boardType: string, postId: string, comment: { authorId: string; authorName: string; content: string }): Promise<ArchiveComment> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('archive_comments')
        .insert({
          post_id: postId,
          author_id: comment.authorId.includes('-') ? comment.authorId : null,
          author_name: comment.authorName,
          content: comment.content,
        })
        .select()
        .single();

      if (error) throw new Error(error.message || '댓글 작성 실패');
      return {
        id: data.id,
        authorId: data.author_id,
        authorName: data.author_name,
        content: data.content,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }

    return { id: `comment-${Date.now()}`, ...comment, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  },

  async updateComment(
    _boardType: string,
    _postId: string,
    commentId: string,
    comment: { authorId: string; content: string }
  ): Promise<ArchiveComment> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('archive_comments')
        .update({
          content: comment.content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw new Error(error.message || '댓글 수정 실패');
      return {
        id: data.id,
        authorId: data.author_id,
        authorName: data.author_name,
        content: data.content,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }

    return {
      id: commentId,
      authorId: comment.authorId,
      authorName: '작성자',
      content: comment.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  async deleteComment(_boardType: string, _postId: string, commentId: string, _userId?: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('archive_comments').delete().eq('id', commentId);
      if (error) throw new Error(error.message || '댓글 삭제 실패');
      return;
    }
  },
};
