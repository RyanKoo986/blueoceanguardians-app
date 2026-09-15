import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function HeroSection() {
  const navigate = useNavigate();

  const scrollToNext = () => {
    const nextSection = document.getElementById('about');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      className="relative w-full overflow-hidden flex items-center justify-center bg-brand-navy-950"
      style={{ minHeight: '100dvh', height: '100dvh' }}
    >
      {/* Background Image - Dokdo Aerial View */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/dokdo photo/dokdo-aerial-hero.jpg"
          alt="독도 항공 전경"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
        <div className="absolute inset-0 bg-slate-950/50 z-10" />
      </div>

      {/* Content - Perfectly Centered in Viewport */}
      <div className="relative z-20 text-center px-4 max-w-5xl mx-auto flex flex-col items-center justify-center pt-14 pb-16 min-h-full">

        {/* Top Tagline - Minimal */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="px-4 py-1 border-b border-white/30">
            <span className="text-white text-sm font-medium tracking-[0.3em] uppercase">
              Republic of Korea, Dokdo
            </span>
          </div>
        </motion.div>

        {/* Main Heading - Solid, No Gradient */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-wide leading-tight drop-shadow-md font-serif"
        >
          BLUE GUARDIANS
        </motion.h1>

        {/* Subheading - Clarity */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-lg md:text-xl text-gray-100 font-normal max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          AI 기술로 만나는 독도와 해양, <br className="hidden md:block" />
          여러분의 따뜻한 관심이 필요합니다.
        </motion.p>

        {/* CTA Buttons - Standard Box Style - No Gradient */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col md:flex-row gap-4 justify-center items-center mb-6 md:mb-8"
        >
          <motion.button
            onClick={() => navigate('/archive')}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="px-10 py-3 bg-brand-cyan-700 hover:bg-brand-cyan-800 text-white border border-brand-cyan-700 transition-colors uppercase tracking-widest text-sm font-bold shadow-sm rounded-none cursor-pointer"
          >
            Explore Data
          </motion.button>
          <motion.button
            onClick={() => navigate('/services/cleanup')}
            whileHover={{ scale: 1.01, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
            whileTap={{ scale: 0.99 }}
            className="px-10 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/60 transition-colors uppercase tracking-widest text-sm font-bold backdrop-blur-sm rounded-none cursor-pointer"
          >
            Join Mission
          </motion.button>
        </motion.div>

        {/* Scroll Indicator - Directly below JOIN MISSION */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="flex justify-center items-center pt-2"
        >
          <button
            type="button"
            onClick={scrollToNext}
            className="animate-bounce flex flex-col items-center gap-1.5 cursor-pointer bg-transparent border-0 group focus:outline-none"
            aria-label="아래로 스크롤하여 더 알아보기"
          >
            <span className="text-white/80 group-hover:text-white text-[10px] uppercase tracking-widest font-sans font-medium transition-colors">
              Scroll Down
            </span>
            <ArrowDown className="text-white/80 group-hover:text-white w-5 h-5 transition-transform group-hover:translate-y-1" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
