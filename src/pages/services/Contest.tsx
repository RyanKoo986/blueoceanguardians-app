import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Trophy, Calendar, Award, CheckCircle, ArrowRight, Sparkles, Layers } from 'lucide-react';

export default function Contest() {
  const navigate = useNavigate();

  const contestCategories = [
    {
      title: '광각 수중 생태 부문 (Wide-Angle)',
      desc: '독도 연안의 웅장한 수중 지형, 해조류 군락, 대형 어류의 군무를 담은 수중 사진',
      prize: '대상 (해양수산부 장관상 / 상금 300만원)',
    },
    {
      title: '접사 해양 생물 부문 (Macro)',
      desc: '독도 고유 생물종, 무척추동물, 해양 미세 생태계를 섬세하게 포착한 마크로 사진',
      prize: '최우수상 (대한잠수협회 회장상 / 상금 150만원)',
    },
    {
      title: '시민 환경 보호 / 비치코밍 부문',
      desc: '해양 쓰레기 수거 및 정화 활동, 독도 수호의 현장을 생생하게 기록한 사진',
      prize: '특별상 (블루오션 가디언스상 / 상금 100만원)',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-28 md:pb-16">
      <Helmet>
        <title>독도 전국 수중사진 공모전 - Blue Guardians</title>
        <meta
          name="description"
          content="사단법인 대한잠수협회가 주관하는 2026 전국 독도 수중사진 공모전 출품 요강 및 작품 접수 안내"
        />
      </Helmet>

      <div className="relative z-10">
        {/* Standardized Hero Section (Matching Archive & Cleanup pages) */}
        <section className="relative min-h-[38vh] sm:h-[40vh] flex items-center justify-center overflow-hidden pt-20">
          <div className="absolute inset-0 z-0">
            <img
              src="/images/dokdo photo/KakaoTalk_20250615_182418407.jpg"
              alt="수중사진 공모전"
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
          <div className="absolute inset-0 bg-black/40 z-10" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 tracking-wider">
              수중사진 공모전
            </h1>
            <p className="text-sm sm:text-lg text-gray-200 tracking-wide font-light">
              푸른 독도 바다의 신비와 생명력을 렌즈에 담아 전 세계에 알려주세요
            </p>
          </div>
        </section>

        {/* Content Section */}
        <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 w-full">
          <div className="max-w-4xl mx-auto space-y-12 sm:space-y-16">
            
            {/* Page Header */}
            <div className="text-center mb-8 sm:mb-12">
              <span className="text-blue-600 font-bold tracking-wider uppercase mb-2 block text-xs sm:text-sm">
                2026 KUDA National Contest
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                제5회 전국 독도 수중사진 공모전
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
                사단법인 대한잠수협회(KUDA)와 함께하는 독도 수중사진 공모전 출품 요강 및 안내입니다.
              </p>
            </div>

            {/* Outline Section - Responsive 3 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-start gap-4 sm:flex-col sm:gap-3 hover:shadow-md transition">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-gray-900">접수 기간</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">2026. 03. 01 ~ 10. 31 (상시 접수 및 심사)</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-start gap-4 sm:flex-col sm:gap-3 hover:shadow-md transition">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-gray-900">참가 자격</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">독도 및 동해 해양에 관심 있는 국내외 다이버 및 전 국민 누구나</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-start gap-4 sm:flex-col sm:gap-3 hover:shadow-md transition">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 text-amber-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-gray-900">총 상금 규모</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">총 1,000만원 상당 (상장 및 부상 수여)</p>
                </div>
              </div>
            </div>

            {/* Categories Detail with Visual Images */}
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto px-2">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">출품 부문 및 시상 내역</h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">각 부문별 최고의 수중 작품을 선정하여 시상합니다.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                {contestCategories.map((cat, idx) => {
                  const categoryImages = [
                    "/images/dokdo photo/KakaoTalk_20251001_214423114_08.jpg",
                    "/images/dokdo photo/KakaoTalk_20250615_073514603_01.jpg",
                    "/images/dokdo photo/KakaoTalk_20251001_214423114_12.jpg",
                  ];

                  return (
                    <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-300">
                      <div className="h-44 sm:h-48 overflow-hidden relative group">
                        <img 
                          src={categoryImages[idx % categoryImages.length]} 
                          alt={cat.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-cyan-300 border border-white/20 text-xs font-bold">
                          Category {idx + 1}
                        </div>
                      </div>
                      
                      <div className="p-5 sm:p-6 space-y-4 flex-grow flex flex-col justify-between">
                        <div className="space-y-2">
                          <h4 className="text-base sm:text-lg font-bold text-gray-900">{cat.title}</h4>
                          <p className="text-xs text-gray-600 leading-relaxed">{cat.desc}</p>
                        </div>
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-900 flex items-center gap-2">
                          <span>🏆</span>
                          <span>{cat.prize}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submission CTA Box */}
            <div className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-white overflow-hidden shadow-xl border border-white/10">
              <div className="relative z-10 max-w-2xl space-y-4 sm:space-y-5">
                <h3 className="text-xl sm:text-3xl font-bold">지금 바로 당신의 작품을 출품하세요</h3>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => navigate('/archive?tab=dokdo')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl shadow-lg transition active:scale-95 text-sm sm:text-base cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    아카이브에 사진 출품하기
                  </button>
                  <Link
                    to="/contact"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs sm:text-sm font-semibold transition active:scale-95 text-center"
                  >
                    공모전 사무국 문의
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
