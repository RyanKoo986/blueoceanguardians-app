import { useNavigate, useLocation } from 'react-router-dom';
import { Camera } from 'lucide-react';

export function ContestPromo() {
  const navigate = useNavigate();
  const location = useLocation();

  // Pages where the promo should NOT appear
  const excludePaths = [
    '/contact', 
    '/admin', 
    '/mypage', 
    '/signup', 
    '/login'
  ];

  // Check if current path starts with any excluded path
  const shouldHide = excludePaths.some(path => location.pathname.startsWith(path));

  if (shouldHide) return null;

  return (
    <section className="py-16 md:py-24 lg:py-32 relative overflow-hidden bg-brand-navy-950">
       <div className="absolute inset-0 w-full h-full overflow-hidden">
           <video 
             autoPlay 
             loop 
             muted 
             playsInline 
             className="w-full h-full object-cover"
           >
             <source src="/images/dokdo photo/diving_video.mp4" type="video/mp4" />
             <source src="https://assets.mixkit.co/videos/preview/mixkit-deep-blue-ocean-surface-1196-large.mp4" type="video/mp4" />
           </video>
           <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
           <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-8 tracking-tight">
             당신의 <span className="text-brand-cyan-400">사진</span>으로 독도를 <span className="text-brand-cyan-400">수호</span>해주세요
           </h2>
          <p className="text-sm sm:text-xl text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto">
            지금 바로 출품하고, 독도 수호의 주인공이 되어보세요.
          </p>
          <button 
            onClick={() => navigate('/archive?tab=dokdo')}
            className="px-8 py-3.5 sm:px-12 sm:py-5 bg-white text-brand-navy-900 hover:bg-gray-100 rounded-full font-bold text-base sm:text-xl transition-all shadow-2xl flex items-center justify-center gap-2.5 sm:gap-3 mx-auto cursor-pointer active:scale-95"
          >
              <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-brand-navy-900" />
              작품 접수하기
          </button>
       </div>
    </section>
  );
}
