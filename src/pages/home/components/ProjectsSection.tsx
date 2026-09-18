import { useState } from 'react';
import { Link } from 'react-router-dom';

export function ProjectsSection() {
  const [activeTab, setActiveTab] = useState('partA');

  const partAFeatures = [
    { icon: 'ri-camera-lens-line', title: '수중 사진 공모전', desc: '독도 수중 사진 접수, 심사, 전시' },
    { icon: 'ri-global-line', title: '다국어 지원', desc: '한국어/영어 이중언어 인터페이스' },
    { icon: 'ri-dashboard-line', title: '활동 대시보드', desc: '지역별 참여 현황 실시간 확인' },
    { icon: 'ri-archive-line', title: '디지털 아카이브', desc: '활동 결과물 체계적 보존' },
  ];

  const partBFeatures = [
    { icon: 'ri-error-warning-line', title: '오류 정보 제보', desc: '잘못된 독도 정보 제보 시스템' },
    { icon: 'ri-robot-line', title: 'AI 콘텐츠 생성', desc: 'AI 기반 정정 이미지 자동 생성' },
    { icon: 'ri-share-forward-line', title: 'SNS 확산', desc: 'Instagram, X, Threads 공유' },
    { icon: 'ri-medal-line', title: '뱃지 시스템', desc: '참여 활동에 따른 디지털 뱃지' },
  ];

  return (
    <section id="projects" className="py-24 relative bg-white border-t border-slate-100">
        {/* Decorative Grid */}
        <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
        style={{
            backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
        }}
        />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-brand-cyan-600 text-xs font-mono tracking-[0.3em] uppercase mb-4 block font-bold">
              System Architecture
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              프로젝트 <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan-600 to-blue-600 text-glow">구성 요소</span>
            </h2>
          </div>

          {/* Tab Buttons - System Module Style */}
          <div className="flex justify-center gap-1 mb-12 bg-white p-1 rounded-lg border border-gray-200 shadow-sm w-fit mx-auto max-w-full">
            <button
              onClick={() => setActiveTab('partA')}
              className={`px-3 sm:px-8 py-2 sm:py-3 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 font-mono tracking-wider ${
                activeTab === 'partA'
                  ? 'bg-brand-cyan-50 text-brand-cyan-700 border border-brand-cyan-200 shadow-sm'
                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
              }`}
            >
              MODULE A: Contest
            </button>
            <button
              onClick={() => setActiveTab('partB')}
              className={`px-3 sm:px-8 py-2 sm:py-3 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 font-mono tracking-wider ${
                activeTab === 'partB'
                  ? 'bg-brand-cyan-50 text-brand-cyan-700 border border-brand-cyan-200 shadow-sm'
                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
              }`}
            >
              MODULE B: AI Correction
            </button>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Description */}
            <div className="space-y-8">
              {activeTab === 'partA' ? (
                <>
                  <div className="inline-block px-3 py-1 bg-blue-50 border border-blue-100 rounded-sm">
                    <span className="text-blue-600 text-xs font-mono tracking-widest uppercase font-bold">Platform Core</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-light text-gray-900 leading-tight break-keep">
                    정부 연계 공모전 기반
                    <br />
                    <span className="font-bold text-gray-900">디지털 플랫폼</span>
                  </h3>
                  <p className="text-gray-600 font-normal leading-relaxed text-base sm:text-lg break-keep">
                    KUDA가 주관하는 전국 독도 수중 사진 공모전의 공식 온라인 플랫폼입니다. 
                    사진 접수부터 심사, 전시까지 전 과정을 <strong className="text-brand-cyan-600">디지털화</strong>하여 효율적인 캠페인 운영을 지원합니다.
                  </p>
                  
                    <div className="pt-8 flex justify-center sm:justify-start">
                      <Link 
                        to="/services/contest"
                        className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-brand-cyan-50 text-gray-900 border border-gray-200 hover:border-brand-cyan-300 rounded-lg shadow-sm font-bold transition-all duration-300 w-full sm:w-auto text-center"
                      >
                        <i className="ri-camera-line text-brand-cyan-600 transition-colors"></i>
                        <span className="tracking-wider text-sm uppercase">Enter Contest</span>
                        <i className="ri-arrow-right-line opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-brand-cyan-600"></i>
                      </Link>
                    </div>

                </>
              ) : (
                <>
                  <div className="inline-block px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-sm">
                    <span className="text-indigo-600 text-xs font-mono tracking-widest uppercase font-bold">Intelligence Core</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-light text-gray-900 leading-tight break-keep">
                    AI 기반 정보 정정
                    <br />
                    <span className="font-bold text-gray-900">시민 참여 모델</span>
                  </h3>
                  <p className="text-gray-600 font-normal leading-relaxed text-base sm:text-lg break-keep">
                    독도에 대한 왜곡된 정보와 편향된 국제 서술을 바로잡기 위한 사용자 주도의 정보 정정 참여 구조입니다. 
                    <strong className="text-brand-cyan-600">AI 기술</strong>을 활용해 정확한 내용의 이미지 기반 콘텐츠를 생성·게시합니다.
                  </p>
                  
                  <div className="pt-8 flex justify-center sm:justify-start">
                    <Link
                      to="/services/ai-fact-check"
                      className="inline-block px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-bold text-sm tracking-widest uppercase shadow-lg transition-all hover:scale-105 active:scale-95 text-center w-full sm:w-auto"
                    >
                      Start Correction
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {(activeTab === 'partA' ? partAFeatures : partBFeatures).map((feature, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-cyan-200 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-cyan-50 transition-colors">
                    <i className={`${feature.icon} text-xl text-gray-400 group-hover:text-brand-cyan-600 transition-colors`}></i>
                  </div>
                  <h4 className="text-gray-900 font-bold mb-2 transition-colors">{feature.title}</h4>
                  <p className="text-gray-500 text-xs font-normal leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Tools Section (Only for Part B) */}
          {activeTab === 'partB' && (
            <div className="mt-16 pt-10 border-t border-gray-200 animate-fade-in-up">
              <h4 className="text-sm font-mono text-gray-400 mb-6 text-center uppercase tracking-widest font-bold">
                Supported AI Engines
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'DALL-E 3', desc: 'Historical Replication' },
                  { name: 'Midjourney', desc: 'Artistic Visualization' },
                  { name: 'Stable Diffusion', desc: 'Custom Styles' },
                  { name: 'Adobe Firefly', desc: 'Copyright Safe' },
                ].map((tool, index) => (
                  <div key={index} className="text-center p-3 rounded-lg bg-white border border-gray-200 hover:border-brand-cyan-300 shadow-sm transition-colors">
                    <div className="text-brand-cyan-600 text-xs font-bold font-mono mb-1">{tool.name}</div>
                    <div className="text-gray-500 text-[10px] font-medium uppercase tracking-wide">{tool.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
