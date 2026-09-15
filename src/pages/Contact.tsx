import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, Building2 } from 'lucide-react';
import { contactService } from '../services/contactService';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await contactService.submitContact(formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err: any) {
      setError(err.message || '문의 접수에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-20">
      <Helmet>
        <title>문의하기 (Contact Us) - Blue Guardians</title>
        <meta
          name="description"
          content="독도 및 해양 생태계 보전 활동, 공모전, 후원 및 단체 협력에 관한 1:1 문의를 남겨주세요."
        />
      </Helmet>

      {/* Hero Banner */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/dokdo photo/KakaoTalk_20251001_214423114_12.jpg"
            alt="Dokdo Ocean"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-slate-950/75 z-10" />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto py-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-wider font-serif">
            문의 및 제휴 신청
          </h1>
          <p className="text-sm md:text-base text-gray-200 font-light tracking-wide max-w-xl mx-auto leading-relaxed">
            블루오션 가디언스와 함께 푸른 독도 바다를 지켜나갈 여러분의 목소리를 환영합니다.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Info Side */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-blue-600 font-bold uppercase tracking-wider text-xs block mb-2 font-mono">
                Get In Touch
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                언제든 편하게<br />문의해 주세요
              </h2>
              <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                공모전 출품 요강, 비치코밍 및 수중 정화활동 단체 참여, 학술 연구 자료 공유 등 문의사항을 남겨주시면 담당자가 신속히 답변드립니다.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">사단법인 대한잠수협회</h4>
                  <p className="text-xs text-gray-500 mt-0.5">블루오션 가디언스 운영 사무국</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">주소</h4>
                  <p className="text-xs text-gray-500 mt-0.5">경기도 고양시 덕양구 삼원로 73, 1020호</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">전화번호</h4>
                  <p className="text-xs text-gray-500 mt-0.5">02-425-5800</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">이메일</h4>
                  <p className="text-xs text-gray-500 mt-0.5">kudaon@daum.net</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-200 shadow-xl">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">문의가 정상 접수되었습니다!</h3>
                  <p className="text-gray-600 text-sm max-w-sm mx-auto">
                    남겨주신 이메일로 담당자가 검토 후 빠른 시일 내에 회신드리겠습니다.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition"
                  >
                    추가 문의 작성
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">
                    1:1 문의 및 신청서 작성
                  </h3>

                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                      성함 / 담당자명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="홍길동"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                      답변받으실 이메일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">
                      문의 내용 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="문의하실 내용이나 단체 협력 제안 사항을 상세히 적어주세요."
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition leading-relaxed"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{ minHeight: '52px', padding: '14px 24px' }}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-base cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      {isSubmitting ? '접수 처리 중...' : '문의하기 접수'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
