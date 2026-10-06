import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Aurora from './home/components/Aurora';
import { CursorGlow } from './home/components/CursorGlow';

export default function About() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900">
      <Helmet>
        <title>About - Blue Guardians</title>
        <meta
          name="description"
          content="Project KUDA 소개. 대한잠수협회(KUDA)와 함께하는 정부 지원 독도 인식 개선 프로젝트입니다."
        />
      </Helmet>

      <div className="fixed inset-0 z-0">
        <Aurora
          colorStops={["#0ea5e9", "#1e40af", "#0c4a6e"]}
          amplitude={1.2}
          blend={0.6}
          speed={0.8}
        />
      </div>
      <CursorGlow />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative h-[40vh] flex items-center justify-center overflow-hidden pt-20">
          <div className="absolute inset-0 z-0">
            <img
              src="/images/dokdo photo/IMG_20250614_100730_221.jpeg"
              alt="Dokdo Scenic"
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
          <div className="absolute inset-0 bg-black/40 z-10" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-wider font-serif">
              기관 소개
            </h1>
            <p className="text-lg text-gray-200 tracking-wide font-light">
              독도와 해양의 가치를 전하는 Blue Guardians입니다
            </p>
          </div>
        </section>

        {/* Content Section */}
        <div className="bg-white/5 pt-10 sm:pt-16 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-20"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Project <span className="text-blue-400">KUDA</span>
              </h1>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center mb-8"
              >
                <img
                  src="/images/3924872.png"
                  alt="Project KUDA Logo"
                  className="w-32 md:w-40 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  loading="lazy"
                />
              </motion.div>
              <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed break-keep">
                디지털 공공외교와 시민 참여를 결합한<br className="hidden sm:inline" /> 대한민국 독도 인식 개선 플랫폼
              </p>
            </motion.div>

            <div className="grid gap-12">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Part A Section */}
                <motion.section
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8"
                >
                  <div className="inline-block px-4 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold mb-6">
                    Part A
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    공모전 및 아카이브
                  </h3>
                  <ul className="space-y-4 text-gray-300">
                    <li className="flex gap-3">
                      <span className="text-blue-400">•</span>
                      정부 지원 독도 캠페인의 공식 디지털 플랫폼
                    </li>
                    <li className="flex gap-3">
                      <span className="text-blue-400">•</span>
                      KUDA 수중 촬영 및 정화 활동 결과물의 디지털 아카이브화
                    </li>
                    <li className="flex gap-3">
                      <span className="text-blue-400">•</span>
                      전국 단위 사진 공모전 및 시민참여 활동 통합 관리
                    </li>
                  </ul>
                </motion.section>

                {/* Part B Section */}
                <motion.section
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8"
                >
                  <div className="inline-block px-4 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-semibold mb-6">
                    Part B
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    AI 정보 정정 및 확산
                  </h3>
                  <ul className="space-y-4 text-gray-300">
                    <li className="flex gap-3">
                      <span className="text-purple-400">•</span>
                      사용자 주도의 정보 정정 참여 구조 구축
                    </li>
                    <li className="flex gap-3">
                      <span className="text-purple-400">•</span>
                      AI 기술을 활용한 오류 정보 분석 및 올바른 콘텐츠 생성
                    </li>
                    <li className="flex gap-3">
                      <span className="text-purple-400">•</span>
                      글로벌 인식 개선을 위한 디지털 공공외교 플랫폼으로 확장
                    </li>
                  </ul>
                </motion.section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
