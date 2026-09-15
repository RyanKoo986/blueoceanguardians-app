import { supabase, isSupabaseConfigured, STORAGE_BUCKET } from '../lib/supabase';

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
  async createReport(data: CreateReportData): Promise<any> {
    if (isSupabaseConfigured && supabase) {
      const { data: record, error } = await supabase
        .from('reports')
        .insert({
          url: data.url,
          description: data.description,
        })
        .select()
        .single();

      if (error || !record) {
        throw new Error(error?.message || '제보 제출에 실패했습니다.');
      }

      if (data.files && data.files.length > 0) {
        for (const file of data.files) {
          const filePath = `reports/${record.id}/${Date.now()}_${file.name}`;
          const { error: uploadErr } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(filePath, file);

          if (!uploadErr) {
            const { data: urlData } = supabase.storage
              .from(STORAGE_BUCKET)
              .getPublicUrl(filePath);

            await supabase.from('report_files').insert({
              report_id: record.id,
              name: file.name,
              filename: filePath,
              size: file.size,
              url: urlData.publicUrl,
            });
          }
        }
      }

      return record;
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
    return newItem;
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
