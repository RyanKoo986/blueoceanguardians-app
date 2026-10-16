import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Google Play UGC policy: members report objectionable posts/comments and block other members

export type ReportReason = 'spam' | 'sexual' | 'hate' | 'privacy' | 'misinformation' | 'other';

export const REPORT_REASONS: Record<ReportReason, string> = {
  spam: '스팸·광고',
  sexual: '음란·선정적인 내용',
  hate: '폭력·혐오·괴롭힘',
  privacy: '개인정보 노출',
  misinformation: '허위 정보·역사 왜곡',
  other: '기타',
};

export interface ReportTarget {
  postId: string;
  commentId?: string;
}

export interface ContentReport {
  id: string;
  reason: ReportReason;
  detail: string | null;
  createdAt: string;
  reporterName: string;
  postId: string;
  postTitle: string;
  commentId: string | null;
  // Text and author of the reported post or comment
  targetContent: string;
  targetAuthorName: string;
}

export interface BlockedUser {
  id: string;
  name: string;
}

interface ContentReportRow {
  id: string;
  reason: ReportReason;
  detail: string | null;
  created_at: string;
  post_id: string;
  comment_id: string | null;
  reporter: { name: string } | null;
  post: { title: string; content: string; author_name: string } | null;
  comment: { content: string; author_name: string } | null;
}

const UNIQUE_VIOLATION = '23505';

const client = () => {
  if (!isSupabaseConfigured || !supabase) throw new Error('서버에 연결되어 있지 않습니다.');
  return supabase;
};

export const moderationService = {
  async reportContent(target: ReportTarget, reason: ReportReason, detail: string): Promise<void> {
    const { error } = await client().from('content_reports').insert({
      post_id: target.postId,
      comment_id: target.commentId ?? null,
      reason,
      detail: detail.trim() || null,
    });
    if (error?.code === UNIQUE_VIOLATION) throw new Error('이미 신고한 콘텐츠입니다.');
    if (error) throw new Error(error.message || '신고 접수에 실패했습니다.');
  },

  // Admin only (RLS)
  async getReports(): Promise<ContentReport[]> {
    const { data, error } = await client()
      .from('content_reports')
      .select(
        'id, reason, detail, created_at, post_id, comment_id, reporter:profiles(name), post:archive_posts(title, content, author_name), comment:archive_comments(content, author_name)'
      )
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message || '신고 목록을 불러오지 못했습니다.');

    return (data as unknown as ContentReportRow[]).map((row) => ({
      id: row.id,
      reason: row.reason,
      detail: row.detail,
      createdAt: row.created_at,
      reporterName: row.reporter?.name ?? '탈퇴한 회원',
      postId: row.post_id,
      postTitle: row.post?.title ?? '',
      commentId: row.comment_id,
      targetContent: (row.comment ?? row.post)?.content ?? '',
      targetAuthorName: (row.comment ?? row.post)?.author_name ?? '',
    }));
  },

  // Admin only (RLS); used when a report needs no action
  async dismissReport(id: string): Promise<void> {
    const { error } = await client().from('content_reports').delete().eq('id', id);
    if (error) throw new Error(error.message || '신고 처리에 실패했습니다.');
  },

  async getBlockedUsers(): Promise<BlockedUser[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data, error } = await supabase
      .from('user_blocks')
      .select('blocked_id, blocked_name')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message || '차단 목록을 불러오지 못했습니다.');
    return (data ?? []).map((row) => ({ id: row.blocked_id, name: row.blocked_name }));
  },

  async blockUser(blocked: BlockedUser): Promise<void> {
    const { error } = await client().from('user_blocks').insert({ blocked_id: blocked.id, blocked_name: blocked.name });
    if (error && error.code !== UNIQUE_VIOLATION) throw new Error(error.message || '차단에 실패했습니다.');
  },

  async unblockUser(blockedId: string): Promise<void> {
    const { error } = await client().from('user_blocks').delete().eq('blocked_id', blockedId);
    if (error) throw new Error(error.message || '차단 해제에 실패했습니다.');
  },
};
