import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Waves, Archive, User, Shield } from 'lucide-react';
import { Keyboard } from '@capacitor/keyboard';
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
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    // 1. Capacitor Keyboard Native Event Listeners (Android: DidShow/DidHide, iOS: WillShow/WillHide)
    const handles: any[] = [];
    const registerCapacitorKeyboard = async () => {
      try {
        const h1 = await Keyboard.addListener('keyboardWillShow', () => setIsKeyboardVisible(true));
        const h2 = await Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
        const h3 = await Keyboard.addListener('keyboardWillHide', () => setIsKeyboardVisible(false));
        const h4 = await Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
        handles.push(h1, h2, h3, h4);
      } catch (e) {
        // Fallback to DOM detection
      }
    };
    registerCapacitorKeyboard();

    // 2. Global Input Focus Capturing (Fires immediately when any input/textarea is focused)
    const checkActiveInput = () => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('contenteditable') === 'true' ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        setIsKeyboardVisible(true);
      } else {
        setIsKeyboardVisible(false);
      }
    };

    document.addEventListener('focusin', checkActiveInput, true);
    document.addEventListener('focus', checkActiveInput, true);
    
    const handleBlur = () => {
      setTimeout(checkActiveInput, 100);
    };
    document.addEventListener('focusout', handleBlur, true);
    document.addEventListener('blur', handleBlur, true);

    // 3. Absolute Screen Height Shrink Detection
    const baseHeight = window.screen.height || window.innerHeight;
    const handleViewportResize = () => {
      const currentHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      if (baseHeight - currentHeight > 140) {
        setIsKeyboardVisible(true);
      } else if (currentHeight >= baseHeight - 70) {
        setIsKeyboardVisible(false);
      }
    };

    window.addEventListener('resize', handleViewportResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportResize);
    }

    return () => {
      handles.forEach((h) => h?.remove?.());
      document.removeEventListener('focusin', checkActiveInput, true);
      document.removeEventListener('focus', checkActiveInput, true);
      document.removeEventListener('focusout', handleBlur, true);
      document.removeEventListener('blur', handleBlur, true);
      window.removeEventListener('resize', handleViewportResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
      }
    };
  }, []);

  const isUserAdmin = Boolean(
    isAdmin || 
    user?.role === 'ADMIN' || 
    user?.id === 'admin' || 
    (user?.email && user.email.toLowerCase().includes('admin'))
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
    <AnimatePresence>
      {!isKeyboardVisible && (
        <motion.nav
          initial={{ opacity: 0, y: 15, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 15, x: '-50%' }}
          transition={{ duration: 0.15 }}
          aria-label="하단 탭 네비게이션"
          className="lg:hidden fixed z-40 bg-white/95 backdrop-blur-xl border border-black/10 rounded-full p-1 shadow-[0_12px_36px_rgba(0,0,0,0.12)] flex items-center justify-between text-gray-900"
          style={{
            position: 'fixed',
            bottom: 'max(env(safe-area-inset-bottom, 0px) + 8px, 24px)',
            left: '50%',
            width: 'min(82%, 320px)',
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
                className="group relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-full transition-all duration-200 select-none cursor-pointer active:scale-95"
                style={{
                  pointerEvents: 'auto',
                  touchAction: 'manipulation',
                }}
              >
                {/* Active Toggle Pill - Apple/Toss Style Soft Gray Fill */}
                {active && (
                  <motion.div
                    layoutId="activeBottomTabPill"
                    className="absolute inset-0 bg-gray-100 border border-gray-200 rounded-full shadow-sm z-0"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}

                <div className="relative z-10 flex items-center justify-center pointer-events-none">
                  <IconComponent 
                    size={15} 
                    strokeWidth={active ? 2.4 : 1.9} 
                    className={`transition-all duration-200 ${
                      active 
                        ? 'text-black scale-105' 
                        : 'text-gray-500 group-hover:text-gray-900'
                    }`}
                  />
                </div>

                <span 
                  className={`relative z-10 text-[11px] mt-0.5 tracking-tight leading-none pointer-events-none transition-colors duration-200 ${
                    active 
                      ? 'font-bold text-black' 
                      : 'font-medium text-gray-500 group-hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

export default BottomTabBar;

