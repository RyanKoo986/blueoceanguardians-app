import type { User, LoginCredentials, SignupCredentials, UpdateUserData } from '../types/auth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const CURRENT_USER_KEY = 'dokdo_current_user';

export const authService = {
  // 로그인
  async login(credentials: LoginCredentials): Promise<User> {
    const loginEmail = credentials.email || (credentials.id ? `${credentials.id}@guardians.org` : '');
    const password = credentials.password || '';

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password,
      });

      if (error) {
        throw new Error(error.message || '로그인에 실패했습니다.');
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: profile?.name || data.user.user_metadata?.name || '가디언즈 회원',
          role: profile?.role || 'USER',
          token: data.session?.access_token,
          affiliation: profile?.affiliation,
          phone: profile?.phone,
          address: profile?.address,
          birthDate: profile?.birth_date,
          licenseGrade: profile?.license_grade,
        };

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return user;
      }
    }

    // 로컬/데모 폴백
    if (!password) {
      throw new Error('비밀번호를 입력해주세요.');
    }
    const isAdminUser = credentials.id === 'admin' || loginEmail.startsWith('admin@');
    const demoUser: User = {
      id: isAdminUser ? 'admin' : 'demo-user-id',
      email: loginEmail || (isAdminUser ? 'admin@blueoceanguardians.org' : 'user@example.com'),
      name: isAdminUser ? '시스템 관리자' : (credentials.id || '체험 가디언'),
      role: isAdminUser ? 'ADMIN' : 'USER',
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(demoUser));
    return demoUser;
  },

  // 회원가입
  async signup(credentials: SignupCredentials): Promise<User> {
    const email = credentials.email || (credentials.id ? `${credentials.id}@guardians.org` : '');
    const password = credentials.password || 'password123';

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: credentials.name || credentials.id,
          },
        },
      });

      if (error) {
        throw new Error(error.message || '회원가입에 실패했습니다.');
      }

      if (data.user) {
        // 프로필 테이블 저장
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: email,
          name: credentials.name || credentials.id || '새 가디언',
          role: 'USER',
          birth_date: credentials.birthDate,
          address: credentials.address,
          phone: credentials.phone,
          affiliation: credentials.affiliation,
          license_grade: credentials.licenseGrade,
        });

        const user: User = {
          id: data.user.id,
          email: data.user.email || email,
          name: credentials.name || '새 가디언',
          role: 'USER',
          token: data.session?.access_token,
          phone: credentials.phone,
          address: credentials.address,
          affiliation: credentials.affiliation,
          licenseGrade: credentials.licenseGrade,
        };

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return user;
      }
    }

    // 로컬/데모 폴백
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: email,
      name: credentials.name || credentials.id || '새 가디언',
      role: 'USER',
      phone: credentials.phone,
      address: credentials.address,
      affiliation: credentials.affiliation,
      licenseGrade: credentials.licenseGrade,
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  // 로그아웃
  logout() {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // 현재 사용자 가져오기
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },

  // 사용자 정보 수정
  async updateUser(userId: string, data: UpdateUserData): Promise<User> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          birth_date: data.birthDate,
          address: data.address,
          phone: data.phone,
          affiliation: data.affiliation,
          license_grade: data.licenseGrade,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        throw new Error(error.message || '정보 수정에 실패했습니다.');
      }
    }

    const current = this.getCurrentUser() || { id: userId };
    const updatedUser: User = {
      ...current,
      ...data,
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  },

  // 전체 사용자 목록 (관리자용)
  async getAllUsers(): Promise<User[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message || '사용자 목록을 불러오는데 실패했습니다.');
      }

      return (data || []).map((p) => ({
        id: p.id,
        email: p.email,
        name: p.name,
        role: p.role,
        phone: p.phone,
        affiliation: p.affiliation,
        address: p.address,
        licenseGrade: p.license_grade,
      }));
    }

    const current = this.getCurrentUser();
    return current ? [current] : [];
  },

  // [관리자] 회원 삭제
  async deleteUser(userId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) {
        throw new Error(error.message || '회원 삭제에 실패했습니다.');
      }
    }
  },

  // [회원 본인 탈퇴 / 계정 삭제] (App Store 가이드라인 5.1.1 준수)
  async deleteAccount(userId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('profiles').delete().eq('id', userId);
      await supabase.auth.signOut().catch(() => {});
    }
    localStorage.removeItem(CURRENT_USER_KEY);
  },
};

