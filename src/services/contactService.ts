import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface ContactForm {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface CreateContactData {
  name: string;
  email: string;
  message: string;
}

const LOCAL_STORAGE_KEY = 'dokdo_contacts';

export const contactService = {
  // 문의 폼 제출
  async submitContact(data: CreateContactData): Promise<ContactForm> {
    if (isSupabaseConfigured && supabase) {
      // Senders cannot read inquiries back (admin-only RLS), so the row is built locally
      const record: ContactForm = {
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email,
        message: data.message,
        createdAt: new Date().toISOString(),
        read: false,
      };
      const { error } = await supabase.from('contacts').insert({
        id: record.id,
        name: record.name,
        email: record.email,
        message: record.message,
      });

      if (error) {
        throw new Error(error.message || '문의 제출에 실패했습니다.');
      }
      return record;
    }

    const items = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const newItem: ContactForm = {
      id: `contact-${Date.now()}`,
      name: data.name,
      email: data.email,
      message: data.message,
      createdAt: new Date().toISOString(),
      read: false,
    };
    items.unshift(newItem);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    return newItem;
  },

  // 문의 목록 조회 (관리자용)
  async getContacts(): Promise<ContactForm[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message || '문의 목록을 불러오는데 실패했습니다.');
      }

      return (data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        message: c.message,
        createdAt: c.created_at,
        read: c.is_read,
      }));
    }

    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  },

  // 문의 읽음 처리
  async markAsRead(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('contacts')
        .update({ is_read: true })
        .eq('id', id);

      if (error) {
        throw new Error(error.message || '읽음 처리에 실패했습니다.');
      }
      return;
    }

    const items = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const item = items.find((c: any) => c.id === id);
    if (item) item.read = true;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  },

  // 문의 삭제
  async deleteContact(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message || '문의 삭제에 실패했습니다.');
      }
      return;
    }

    const items = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]').filter((c: any) => c.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  },
};
