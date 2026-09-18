
import { useState } from 'react';
import { contactService } from '../../../services/contactService';

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSubmitStatus('');
    
    try {
      await contactService.submitContact(formData);
      setSubmitStatus('참여 신청이 완료되었습니다!');
      setFormData({ name: '', email: '', message: '' });
    } catch (err: any) {
      setError(err.message || '문의 제출에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const participationWays = [
    {
      icon: 'ri-camera-line',
      title: '사진 공모전 참여',
      desc: '독도 수중 사진을 촬영하고 공모전에 출품하세요'
    },
    {
      icon: 'ri-error-warning-line',
      title: '오류 정보 제보',
      desc: '잘못된 독도 관련 정보를 발견하면 제보해주세요'
    },
    {
      icon: 'ri-share-line',
      title: 'SNS 확산',
      desc: '올바른 정보를 SNS에 공유하여 인식 개선에 동참하세요'
    }
  ];

  return (
    <section id="contact" className="py-24 bg-slate-50 border-t border-slate-100">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-brand-cyan-600 text-sm font-bold tracking-[0.3em] uppercase mb-4 block">
              Get Involved
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight break-keep">
              <span className="bg-gradient-to-r from-brand-cyan-600 to-blue-600 bg-clip-text text-transparent">독도와 해양</span>에 관심을 가져주세요
            </h2>
            <p className="text-gray-600 text-base sm:text-lg font-normal max-w-2xl mx-auto leading-relaxed break-keep">
              우리의 소중한 유산인 독도와 아름다운 해양 생태계, <br className="hidden sm:inline"/>
              여러분의 관심이 모여 더 큰 가치를 만들어냅니다.
            </p>
          </div>

          {/* Participation Ways */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {participationWays.map((way, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-brand-cyan-200 transition-all duration-300 text-center group hover:shadow-md"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-cyan-50 transition-colors shadow-sm border border-gray-100">
                  <i className={`${way.icon} text-2xl text-brand-cyan-600`}></i>
                </div>
                <h3 className="text-gray-900 font-bold mb-2">{way.title}</h3>
                <p className="text-gray-500 text-sm font-normal">{way.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left - Value Proposition */}
            <div className="space-y-8">
              <h3 className="text-3xl font-light text-gray-900 leading-tight">
                참여를 통해 얻는
                <br />
                <span className="text-brand-cyan-600 font-bold">가치</span>
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-cyan-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-lightbulb-line text-brand-cyan-600"></i>
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-bold mb-1">교육적 가치</h4>
                    <p className="text-gray-600 text-sm font-normal">
                      최신 AI 기술 습득과 역사의식을 동시에 기르는 융합 교육 효과
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-cyan-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-heart-line text-brand-cyan-600"></i>
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-bold mb-1">사회적 의미</h4>
                    <p className="text-gray-600 text-sm font-normal">
                      젊은 세대의 관점에서 독도 문제를 재조명하고 새로운 형태의 영토 의식 표현
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-cyan-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-code-line text-brand-cyan-600"></i>
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-bold mb-1">기술적 성장</h4>
                    <p className="text-gray-600 text-sm font-normal">
                      웹 개발, AI 활용, 콘텐츠 기획 등 다양한 IT 기술 경험 및 포트폴리오 구축
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="text-6xl font-extralight text-gray-100 tracking-[0.2em] pointer-events-none select-none">
                  DOKDO
                </div>
              </div>
            </div>

            {/* Right - Contact Form */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100" style={{ touchAction: 'pan-y' }}>
              <h4 className="text-xl font-bold text-gray-900 mb-6">참여 신청</h4>
              
              <form onSubmit={handleSubmit} className="space-y-6" style={{ touchAction: 'pan-y' }}>
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="이름"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 text-gray-900 placeholder-gray-400 focus:border-brand-cyan-500 focus:bg-white focus:outline-none transition-all duration-300 font-medium"
                  />
                </div>
                
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="이메일"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 text-gray-900 placeholder-gray-400 focus:border-brand-cyan-500 focus:bg-white focus:outline-none transition-all duration-300 font-medium"
                  />
                </div>
                
                <div>
                  <textarea
                    name="message"
                    placeholder="참여하고 싶은 활동이나 의견을 남겨주세요"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    maxLength={500}
                    rows={4}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 text-gray-900 placeholder-gray-400 focus:border-brand-cyan-500 focus:bg-white focus:outline-none transition-all duration-300 resize-none font-medium"
                  ></textarea>
                  <div className="text-right text-gray-400 text-sm mt-2">
                    {formData.message.length}/500
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-brand-cyan-600 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer tracking-wide"
                >
                  {isSubmitting ? '제출 중...' : '참여 신청하기'}
                </button>
                
                {error && (
                  <div className="text-center py-2 text-red-500 text-sm font-medium">
                    {error}
                  </div>
                )}
                
                {submitStatus && (
                  <div className="text-center py-2 text-brand-cyan-600 font-bold">
                    {submitStatus}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
