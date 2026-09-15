import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Waves, Archive, User, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TabItem {
  key: string;
  label: string;
  path: string;
  icon: typeof Home;
}

export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user } = useAuth();

  const isUserAdmin = Boolean(
    isAdmin || 
    user?.role === 'ADMIN' || 
    user?.id === 'admin' || 
    (user?.email && user.email.toLowerCase().startsWith('admin'))
  );

  const tabs: TabItem[] = [
    { key: 'home', label: '홈', path: '/', icon: Home },
    { key: 'cleanup', label: '수중정화', path: '/services/cleanup', icon: Waves },
    { key: 'archive', label: '아카이브', path: '/archive', icon: Archive },
    isUserAdmin
      ? { key: 'admin', label: '관리자', path: '/admin', icon: Shield }
      : { key: 'my', label: 'MY', path: isAuthenticated ? '/mypage' : '/login', icon: User },
  ];

  const isActive = (tab: TabItem) => {
    if (tab.path === '/') {
      return location.pathname === '/';
    }
    if (tab.key === 'admin') {
      return location.pathname.startsWith('/admin');
    }
    if (tab.key === 'my') {
      return location.pathname === '/mypage' || location.pathname === '/login' || location.pathname === '/signup';
    }
    return location.pathname.startsWith(tab.path);
  };

  return (
    <nav 
      aria-label="하단 탭 네비게이션"
      className="lg:hidden fixed z-40 bg-slate-900/90 backdrop-blur-xl border border-white/15 rounded-full p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.65)] flex items-center justify-between"
      style={{
        position: 'fixed',
        bottom: 'max(env(safe-area-inset-bottom, 0px), 16px)',
        left: '16px',
        right: '16px',
        maxWidth: '420px',
        margin: '0 auto',
        pointerEvents: 'auto',
        touchAction: 'manipulation',
      }}
    >
      {tabs.map((tab) => {
        const active = isActive(tab);
        const IconComponent = tab.icon;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              if (location.pathname !== tab.path) {
                navigate(tab.path);
              } else if (tab.path === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-full transition-all duration-200 select-none cursor-pointer active:scale-95"
            style={{
              pointerEvents: 'auto',
              touchAction: 'manipulation',
            }}
          >
            {/* Active Toggle Pill */}
            {active && (
              <motion.div
                layoutId="activeBottomTabPill"
                className="absolute inset-0 bg-blue-600/35 border border-blue-400/40 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.4)] -z-10"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}

            <div className="relative flex items-center justify-center pointer-events-none">
              <IconComponent 
                size={19} 
                strokeWidth={active ? 2.4 : 1.8} 
                className={`transition-all duration-200 ${
                  active 
                    ? 'text-blue-400 scale-110 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              />
            </div>

            <span 
              className={`text-[10.5px] mt-0.5 tracking-tight leading-none pointer-events-none transition-colors duration-200 ${
                active 
                  ? 'font-bold text-blue-300' 
                  : 'font-medium text-slate-400'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomTabBar;

