import { motion } from "framer-motion";

export function ProductSection() {
  const features = [
    {
      icon: 'ri-camera-lens-line',
      title: '공모전 허브',
      description: '독도 수중 사진 접수, 심사, 전시를 위한 메인 플랫폼으로 전국 단위의 사진 공모전을 통합 관리합니다.'
    },
    {
      icon: 'ri-global-line',
      title: '다국어 인터페이스',
      description: '한국어와 영어를 지원하는 이중언어 기반 웹 인터페이스로 국내외 사용자의 참여를 촉진합니다.'
    },
    {
      icon: 'ri-robot-line',
      title: 'AI 정보 정정 시스템',
      description: '왜곡된 독도 정보를 AI 기술로 정확한 내용의 이미지 콘텐츠로 자동 생성하여 정정합니다.'
    },
    {
      icon: 'ri-dashboard-line',
      title: '캠페인 대시보드',
      description: '지역별 참여 현황과 활동 데이터를 실시간으로 확인하고 콘텐츠를 아카이빙할 수 있습니다.'
    },
    {
      icon: 'ri-share-line',
      title: 'SNS 공유 확산',
      description: '생성된 콘텐츠를 Instagram, X, Threads 등으로 바로 공유하여 글로벌 인식 개선을 도모합니다.'
    },
    {
      icon: 'ri-medal-line',
      title: '뱃지 & 챌린지',
      description: '정정 활동 참여자에게 디지털 뱃지를 부여하고 게이미피케이션을 통해 지속적 참여를 유도합니다.'
    }
  ];

  return (
    <section id="products" className="py-24 relative bg-slate-50">
        {/* Background Grid - Removed for clean look */}
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-brand-cyan-600 text-xs font-mono tracking-[0.3em] uppercase mb-4 block font-bold">
            System Capabilities
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            플랫폼
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan-600 to-blue-600"> 주요 기능</span>
          </h2>
          <p className="text-gray-600 text-lg font-normal max-w-3xl mx-auto leading-relaxed">
            디지털 기술을 활용한 참여형 학습 콘텐츠 중심의 구조로 설계되어, <br className="hidden md:block"/>
            사용자가 직접 탐색하고 체험하며 독도에 대해 주체적으로 사고할 수 있습니다.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group bg-white rounded-xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-brand-cyan-50 border border-brand-cyan-100 group-hover:bg-brand-cyan-600 transition-colors">
                <i className={`${feature.icon} text-2xl text-brand-cyan-600 group-hover:text-white transition-colors`}></i>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-cyan-700 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-gray-500 font-medium leading-relaxed text-sm group-hover:text-gray-700">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
