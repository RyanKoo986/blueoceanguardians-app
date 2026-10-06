import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { uploadFiles } from '../lib/storageUpload';

export interface CreateReportData {
  url: string;
  description: string;
  files?: File[];
}

export interface ReportItem {
  id: string;
  url: string;
  description: string;
  isRead?: boolean;
  createdAt: string;
  files?: Array<{
    name: string;
    filename: string;
    size: number;
    url: string;
  }>;
}

const LOCAL_STORAGE_KEY = 'dokdo_reports';

export const reportService = {
  // Returns the names of attachments that could not be uploaded
  async createReport(data: CreateReportData): Promise<string[]> {
    if (isSupabaseConfigured && supabase) {
      // Submitters cannot read reports back (admin-only RLS), so the id is generated here
      const reportId = crypto.randomUUID();
      const { error } = await supabase.from('reports').insert({
        id: reportId,
        url: data.url,
        description: data.description,
      });

      if (error) {
        throw new Error(error.message || '제보 제출에 실패했습니다.');
      }

      const { uploaded, failedNames } = await uploadFiles(`reports/${reportId}`, data.files ?? []);
      if (uploaded.length > 0) {
        await supabase.from('report_files').insert(uploaded.map((file) => ({ report_id: reportId, ...file })));
      }
      return failedNames;
    }

    const items = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const newItem = {
      id: `report-${Date.now()}`,
      ...data,
      isRead: false,
      createdAt: new Date().toISOString(),
      files: [],
    };
    items.unshift(newItem);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    return [];
  },

  async getReports(): Promise<ReportItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          report_files (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message || '제보 목록을 불러오는데 실패했습니다.');

      return (data || []).map((item: any) => ({
        id: item.id,
        url: item.url,
        description: item.description,
        isRead: item.is_read,
        createdAt: item.created_at,
        files: (item.report_files || []).map((f: any) => ({
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
      await supabase.from('reports').update({ is_read: true }).eq('id', id);
      return;
    }

    const items = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const item = items.find((i: any) => i.id === id);
    if (item) item.isRead = true;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  },

  async deleteReport(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('reports').delete().eq('id', id);
      if (error) throw new Error(error.message || '제보 삭제에 실패했습니다.');
      return;
    }

    const items = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]').filter((i: any) => i.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  },
};
