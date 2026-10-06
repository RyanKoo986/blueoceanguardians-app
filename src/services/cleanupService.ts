import { supabase, isSupabaseConfigured, STORAGE_BUCKET } from '../lib/supabase';

export interface CreateCleanupData {
  name: string;
  contact: string;
  region?: string;
  message: string;
  files?: File[];
}

export interface CleanupItem {
  id: string;
  name: string;
  contact: string;
  region?: string;
  message: string;
  isRead?: boolean;
  createdAt: string;
  files?: Array<{
    name: string;
    filename: string;
    size: number;
    url: string;
  }>;
}

const LOCAL_STORAGE_KEY = 'dokdo_cleanup_requests';

export const cleanupService = {
  async createCleanup(data: CreateCleanupData): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      // Applicants cannot read requests back (admin-only RLS), so the id is generated here
      const cleanupId = crypto.randomUUID();
      const { error } = await supabase.from('cleanup_requests').insert({
        id: cleanupId,
        name: data.name,
        contact: data.contact,
        region: data.region || '',
        message: data.message,
      });

      if (error) {
        throw new Error(error.message || '신청 제출에 실패했습니다.');
      }

      if (data.files && data.files.length > 0) {
        for (const file of data.files) {
          const filePath = `cleanup/${cleanupId}/${Date.now()}_${file.name}`;
          const { error: uploadErr } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(filePath, file);

          if (!uploadErr) {
            const { data: urlData } = supabase.storage
              .from(STORAGE_BUCKET)
              .getPublicUrl(filePath);

            await supabase.from('cleanup_files').insert({
              cleanup_id: cleanupId,
              name: file.name,
              filename: filePath,
              size: file.size,
              url: urlData.publicUrl,
            });
          }
        }
      }
      return;
    }

    const items = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const newItem = {
      id: `cleanup-${Date.now()}`,
      ...data,
      isRead: false,
      createdAt: new Date().toISOString(),
      files: [],
    };
    items.unshift(newItem);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  },

  async getCleanups(): Promise<CleanupItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('cleanup_requests')
        .select(`
          *,
          cleanup_files (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message || '신청 목록을 불러오는데 실패했습니다.');

      return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        contact: item.contact,
        region: item.region,
        message: item.message,
        isRead: item.is_read,
        createdAt: item.created_at,
        files: (item.cleanup_files || []).map((f: any) => ({
          name: f.name,
          filename: f.filename,
          size: f.size,
          url: f.url,
        })),
      }));
    }

    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  },

  async markAsRead(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('cleanup_requests').update({ is_read: true }).eq('id', id);
      return;
    }

    const items = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const item = items.find((i: any) => i.id === id);
    if (item) item.isRead = true;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  },

  async deleteCleanup(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('cleanup_requests').delete().eq('id', id);
      if (error) throw new Error(error.message || '신청 삭제에 실패했습니다.');
      return;
    }

    const items = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]').filter((i: any) => i.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  },
};
