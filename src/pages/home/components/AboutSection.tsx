import { motion } from 'framer-motion';

export function AboutSection() {
  const objectives = [
    '정부 지원 독도 캠페인의 공식 디지털 플랫폼 설계·개발',
    'KUDA의 수중 촬영 및 정화 활동 결과물 디지털 아카이브화',
    '전국 단위 사진 공모전, 생태 기록, 시민참여 활동 통합 관리',
    '사용자 간 좋아요·댓글 등 인터랙션 기능을 통한 참여 유도',
    '캠페인 결과 기록 및 아카이빙으로 지속 가능한 기반 마련',
    'KUDA 역할과 활동 소개를 통한 주관 기관 인식 제고'
  ];

  return (
    <section id="about" className="py-24 relative bg-slate-50 border-t border-slate-200">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-brand-cyan-600 text-xs font-mono tracking-[0.3em] uppercase mb-4 block font-bold">
              About Organization
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight tracking-tight break-keep">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan-600 to-blue-600">대한잠수협회</span>와 함께하는<br />
              독도 수호 캠페인
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left - About KUDA */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-xl p-10 border border-gray-100 shadow-sm relative overflow-hidden group hover:border-brand-cyan-100 transition-colors">
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <i className="ri-building-line text-9xl text-gray-900"></i>
                 </div>
                <div className="flex items-center gap-6 mb-8 relative z-10">
                  <div className="w-20 h-20 flex items-center justify-center bg-gray-50 rounded-full p-4 border border-gray-100 shadow-sm">
                    <img 
                      src="/images/3924872.png" 
                      alt="KUDA Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">대한잠수협회</h3>
                    <p className="text-brand-cyan-600 font-mono text-xs tracking-wider font-bold">Korea Underwater Diving Association</p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6 relative z-10">
                  <p className="text-gray-600 leading-relaxed font-normal text-base">
                    본 협회는 잠수 및 수상안전에 관한 전문 교육과 연구, 체계적인 수련 활동 및 안전관리 기술의 개발·보급을 통해 국민의 건강 증진과 안전의식 향상에 힘쓰고 있습니다. 또한 건전한 해양·수중 스포츠 문화를 조성하고, 전국 각지부와 산하단체를 유기적으로 지도·육성하여 지역사회와 함께 성장하는 협회로 자리매김하고 있습니다.
                  </p>
                  <p className="text-gray-600 leading-relaxed font-normal text-base">
                    아울러 수중 자연보호 및 환경보전 활동을 적극 전개함으로써 해양환경의 가치와 중요성을 널리 알리고, 국민 생활체육 발전과 국가 및 지역사회 문화 발전에 기여하는 것을 목적으로 합니다.
                  </p>
                  <p className="text-sm text-brand-cyan-700 font-medium pt-2">
                    <span className="font-bold">연혁</span> · 1979.01.31 사단법인 대한잠수협회 창립
                  </p>
                </div>

                <div className="space-y-4 border-t border-gray-100 pt-8 relative z-10">
                  <div className="flex items-center gap-4 group/item">
                    <div className="w-8 h-8 rounded-full bg-brand-cyan-50 flex items-center justify-center group-hover/item:bg-brand-cyan-100 transition-colors">
                        <i className="ri-checkbox-circle-line text-brand-cyan-600"></i>
                    </div>
                    <span className="text-gray-600 group-hover/item:text-gray-900 transition-colors">독도 수중 촬영 및 정화 활동</span>
                  </div>
                  <div className="flex items-center gap-4 group/item">
                    <div className="w-8 h-8 rounded-full bg-brand-cyan-50 flex items-center justify-center group-hover/item:bg-brand-cyan-100 transition-colors">
                        <i className="ri-checkbox-circle-line text-brand-cyan-600"></i>
                    </div>
                    <span className="text-gray-600 group-hover/item:text-gray-900 transition-colors">전국 독도 수중 사진 공모전 운영</span>
                  </div>
                  <div className="flex items-center gap-4 group/item">
                    <div className="w-8 h-8 rounded-full bg-brand-cyan-50 flex items-center justify-center group-hover/item:bg-brand-cyan-100 transition-colors">
                        <i className="ri-checkbox-circle-line text-brand-cyan-600"></i>
                    </div>
                    <span className="text-gray-600 group-hover/item:text-gray-900 transition-colors">대중 인식 확산 캠페인 진행</span>
                  </div>
                </div>
              </div>

              {/* Target Audience */}
              <div className="bg-brand-cyan-50 rounded-xl p-8 border border-brand-cyan-100">
                <h4 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                  <i className="ri-focus-3-line text-brand-cyan-600 text-xl"></i>
                  주요 타겟
                </h4>
                <p className="text-gray-700 font-normal text-sm leading-relaxed">
                  역사적·법적 배경이나 독도의 지리적·국제적 중요성에 대한 이해가 낮은 
                  <strong className="text-brand-cyan-700 font-bold"> 10-20대 및 외국인</strong> 대상의 
                  인식 격차 해소를 목표로 합니다.
                </p>
              </div>

               {/* New: Divers Dedication & Help CTA */}
               <div className="pt-8 border-t border-gray-100 space-y-6">
                 <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                        보이지 않는 곳에서의 헌신
                    </h3>
                    <p className="text-gray-600 leading-relaxed font-normal text-sm">
                        지금 이 순간에도 <span className="text-brand-cyan-700 font-bold">대한잠수협회(KUDA)</span>의 잠수부들은 차가운 바닷속에서 독도의 생태계를 지키고, 
                        아름다운 수중 비경을 기록하기 위해 땀 흘리고 있습니다. 
                        우리의 바다와 독도를 지키는 이들의 숭고한 노력에 함께해주세요.
                    </p>
                 </div>
                 
                 {/* 3-Photo Grid */}
                 <div className="grid grid-cols-3 gap-3 h-32">
                    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group">
                        <img 
                            src="/images/dokdo%20photo/KakaoTalk_20251001_214423114_08.jpg" 
                            alt="Divers Preparation" 
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>
                    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group">
                         <img 
                            src="/images/dokdo%20photo/KakaoTalk_20251001_214423114_01.jpg" 
                            alt="Dokdo Scenic" 
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                         <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <span className="text-white font-serif text-sm tracking-widest opacity-80 backdrop-blur-sm px-2 py-1 rounded-sm border border-white/30">DOKDO KOREA</span>
                         </div>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group">
                        <img 
                            src="/images/dokdo%20photo/KakaoTalk_20251001_214423114_12.jpg" 
                            alt="Underwater Action" 
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>
                 </div>

                 <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg text-center">
                    <p className="font-serif text-lg mb-2">"독도와 우리 바다를 지켜주세요"</p>
                    <p className="text-brand-cyan-400 text-xs font-mono tracking-wider">SUPPORT OUR OCEAN GUARDIANS</p>
                 </div>
               </div>
            </motion.div>

            {/* Right - Objectives */}
            <div className="space-y-6">
              <motion.h3 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-2xl font-light text-gray-900 mb-8 tracking-wide flex items-center gap-3"
              >
                <span className="w-1 h-8 bg-brand-cyan-500 block"></span>
                프로젝트 <span className="font-bold text-gray-900">목표</span>
              </motion.h3>
              
              <div className="space-y-4">
                {objectives.map((objective, index) => (
                    <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-5 p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-cyan-200 transition-all duration-300 group"
                    >
                    <span className="flex-shrink-0 w-8 h-8 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-brand-cyan-600 text-xs font-mono font-bold group-hover:bg-brand-cyan-50 group-hover:border-brand-cyan-200 transition-colors">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="text-gray-600 font-normal leading-relaxed pt-1 group-hover:text-gray-900 transition-colors">
                        {objective}
                    </p>
                    </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
