import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export function FloatingScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    let ticking = false;

    const checkScroll = () => {
      const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
      // Show ONLY when user is scrolling UP and is past the hero area (> 300px)
      const isScrollingUp = currentScrollY < lastScrollY;
      setIsVisible(isScrollingUp && currentScrollY > 300);
      lastScrollY = currentScrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(checkScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
    // Fallback for documentElement
    if (document.documentElement) {
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.6, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          aria-label="페이지 맨 위로 이동"
          className="fixed flex items-center justify-center w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-900 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-black/10 transition-all cursor-pointer group select-none"
          style={{
            position: 'fixed',
            zIndex: 9999,
            right: 'max(env(safe-area-inset-right, 0px), 1.25rem)',
            bottom: 'max(env(safe-area-inset-bottom, 0px) + 74px, 86px)',
          }}
        >
          <ArrowUp 
            className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5 text-gray-900" 
            strokeWidth={2.5}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default FloatingScrollToTop;
