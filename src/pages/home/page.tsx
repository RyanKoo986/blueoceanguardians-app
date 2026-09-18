import { useState, useEffect } from 'react';
import { HeroSection } from './components/HeroSection';
import { ProductSection } from './components/ProductSection';
import { AITrendSection } from './components/AITrendSection';
import { AboutSection } from './components/AboutSection';
import { ProjectsSection } from './components/ProjectsSection';
import { ContactSection } from './components/ContactSection';

import { Helmet } from 'react-helmet-async';

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // 인트로를 1.5초간 표시한 후 페이드아웃 시작
    const introTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1500);

    // 페이드아웃 애니메이션 후 인트로 숨기고 콘텐츠 표시
    const fadeOutTimer = setTimeout(() => {
      setShowIntro(false);
      setShowContent(true);
    }, 2500);

    return () => {
      clearTimeout(introTimer);
      clearTimeout(fadeOutTimer);
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-brand-navy-950">
      <Helmet>
        <title>Blue Guardians - 독도 인식 개선 플랫폼</title>
        <meta name="description" content="대한잠수협회(KUDA)와 함께하는 독도 수중 사진 공모전 및 AI 정보 정정 캠페인. 독도의 아름다움과 올바른 역사를 전 세계에 알립니다." />
        <meta property="og:title" content="Blue Guardians - 독도 인식 개선 플랫폼" />
        <meta property="og:description" content="대한잠수협회(KUDA)와 함께하는 독도 수중 사진 공모전 및 AI 정보 정정 캠페인." />
        <meta property="og:image" content="https://static.readdy.ai/image/ef1aae41220ad17a1705abffff22a58b/79e5b45dc8df25c645f3c7a350468079.jpeg" />
        <meta name="version" content="2026-01-12-v2-fix-intro-color" />
      </Helmet>
      {/* Global Aurora Background & CursorGlow removed for formal UI */}
      {/* <div className="fixed inset-0 z-0"> ... </div> */}
      
      {/* Intro Section - ShowcaseSection with H2 "디지털 공공외교" */}
      {showIntro && (
        <div 
          className={`fixed inset-0 z-50 transition-opacity duration-1000 ${
            fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="min-h-screen flex items-center justify-center bg-brand-navy-950">
            <div className="container mx-auto px-6">
              <div className="max-w-6xl mx-auto">
                <div className="text-center">
                  <span className="text-brand-cyan-400 text-sm font-mono tracking-[0.3em] uppercase mb-4 block">
                    Project Overview
                  </span>
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-8 tracking-[0.05em] leading-snug sm:leading-tight break-keep">
                    <div className="mb-[10px] break-keep">
                      디지털 공공외교와<br />
                      시민 참여를 결합한
                    </div>
                    <div className="break-keep">
                      <span className="bg-gradient-to-r from-brand-cyan-400 to-brand-cyan-600 bg-clip-text text-transparent font-bold">
                        독도 인식 개선 플랫폼
                      </span>
                    </div>
                    <div className="mt-8 flex justify-center">
                      <img 
                        src="/images/3924872.png" 
                        alt="Project KUDA Logo" 
                        className="w-24 md:w-32 object-contain drop-shadow-[0_0_15px_rgba(0,240,255,0.5)] animate-fade-in"
                      />
                    </div>
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className={`relative z-10 transition-opacity duration-1000 ${
        showContent ? 'opacity-100' : 'opacity-0'
      }`}>
        {showContent && (
          <>
            {/* Black overlay for sections */}
        <div className="relative">
          <div className="absolute inset-0 z-0"></div>
          <div className="relative z-10">
            <HeroSection />
            <AboutSection />
            <AITrendSection />
            <div id="products">
              <ProductSection />
            </div>
            <ProjectsSection />
            <ContactSection />
      
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
