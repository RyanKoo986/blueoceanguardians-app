import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Camera, ChevronRight, Home, Users, type LucideIcon } from 'lucide-react';

interface HighlightCard {
  title: string;
  lines: string[];
  icon: LucideIcon;
  iconBox: string;
  iconColor: string;
}

const HIGHLIGHTS: HighlightCard[] = [
  {
    title: '생태 기록',
    lines: ['단순한 풍경 사진을 넘어,', '독도 해양 생태계의 다양성을', '학술적 가치가 있게 기록합니다.'],
    icon: Camera,
    iconBox: 'bg-brand-navy-50 group-hover:bg-brand-navy-600',
    iconColor: 'text-brand-navy-600',
  },
  {
    title: '국민 참여',
    lines: ['전문 다이버부터 일반인까지,', '누구나 독도 수호 활동의', '주체가 될 수 있습니다.'],
    icon: Users,
    iconBox: 'bg-brand-cyan-50 group-hover:bg-brand-cyan-500',
    iconColor: 'text-brand-cyan-600',
  },
  {
    title: '수상 혜택',
    lines: ['해양수산부 장관상 및', '역대 최대 규모의 시상금으로', '여러분의 열정을 응원합니다.'],
    icon: Award,
    iconBox: 'bg-purple-50 group-hover:bg-purple-500',
    iconColor: 'text-purple-600',
  },
];

const PROCESS_STEPS = [
  { step: '01', title: '작품 접수', desc: '온라인 접수 페이지를 통해\n원본 사진 파일 제출' },
  { step: '02', title: '예선 심사', desc: '전문가 심사위원단의\n1차 블라인드 평가' },
  { step: '03', title: '본선 심사', desc: '고해상도 인화 심사 및\n대국민 온라인 투표' },
  { step: '04', title: '시상식', desc: '서울 코엑스 특별 전시관\n시상 및 전시회 개최' },
];

export default function Contest() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 md:pb-16">
      <Helmet>
        <title>독도 수중 사진 공모전 - Blue Guardians</title>
        <meta
          name="description"
          content="쿠다(KUDA, 대한잠수협회)와 블루가디언즈가 함께하는 독도 수중 사진 공모전. 독도 바닷속 생태를 담은 사진을 공모합니다."
        />
      </Helmet>

      {/* Hero */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/dokdo photo/KakaoTalk_20250615_073514603_01.jpg"
            alt="독도 수중 사진 공모전"
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-wider font-serif">
            독도 수중 사진 공모전
          </h1>
          <p className="text-sm sm:text-lg text-gray-200 tracking-wide font-light break-keep">
            쿠다(KUDA)와 블루가디언즈가 여러분의 시선으로 담아낸 독도의 아름다운 비경을 기다립니다
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center text-sm text-gray-600">
          <Link to="/" className="flex items-center hover:text-blue-600 transition-colors" aria-label="홈">
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          <span>주요 사업</span>
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          <span className="font-bold text-gray-900">공모전</span>
        </div>
      </div>

      {/* Highlights */}
      <section className="py-12 sm:py-24 relative sm:-mt-20 z-30 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
          {HIGHLIGHTS.map(({ title, lines, icon: Icon, iconBox, iconColor }, idx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (idx + 1) * 0.1 }}
              className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300"
            >
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${iconBox}`}>
                <Icon className={`w-10 h-10 group-hover:text-white transition-colors ${iconColor}`} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {lines.map((line, i) => (
                  <span key={line}>
                    {i > 0 && <br />}
                    {line}
                  </span>
                ))}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="py-12 sm:py-24 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">참여 프로세스</h2>
            <p className="text-slate-500 text-base sm:text-lg">간편하고 투명한 공모전 진행 과정을 안내해 드립니다.</p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-slate-200 via-brand-cyan-200 to-slate-200 -translate-y-1/2 z-0" />
            <div className="grid md:grid-cols-4 gap-6 sm:gap-8 relative z-10">
              {PROCESS_STEPS.map(({ step, title, desc }, idx) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15 }}
                  className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 flex flex-col items-center text-center relative"
                >
                  <div className="w-12 h-12 rounded-full bg-brand-navy-900 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-lg ring-4 ring-white">
                    {step}
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">{title}</h4>
                  <p className="text-slate-600 text-sm whitespace-pre-line leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
