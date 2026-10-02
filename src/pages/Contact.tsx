import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle } from 'lucide-react';
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
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('모든 필수 항목을 입력해 주세요.');
      return;
    }

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
    <div 
      className="min-h-screen bg-gray-50/50 flex flex-col"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 76px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 90px)',
      }}
    >
      <Helmet>
        <title>문의하기 (Contact Us) - Blue Guardians</title>
        <meta
          name="description"
          content="Blue Guardians에 전하고 싶은 의견이나 궁금한 점을 남겨주세요."
        />
      </Helmet>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Page Title Header */}
        <div className="mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            문의하기
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-2 font-normal">
            Blue Guardians에 전하고 싶은 의견이나 궁금한 점을 남겨주세요.
          </p>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Information Cards */}
          <div className="lg:col-span-4 space-y-6">
            {/* Notice Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-4">
                안내사항
              </h2>
              <ul className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold select-none">•</span>
                  <span>접수된 문의는 담당자 확인 후 순차적으로 답변을 드립니다.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold select-none">•</span>
                  <span>답변 내용은 작성해주신 이메일로 발송됩니다.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold select-none">•</span>
                  <span>욕설이나 비방 등 부적절한 내용은 통보 없이 삭제될 수 있습니다.</span>
                </li>
              </ul>
            </div>

            {/* Secretariat Info Card */}
            <div className="bg-[#eff6ff] rounded-2xl p-6 border border-blue-100 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-4">
                운영 사무국
              </h2>
              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <span className="block text-[11px] font-bold text-blue-600 tracking-wider mb-1 uppercase">
                    EMAIL
                  </span>
                  <a
                    href="mailto:kudaon@daum.net"
                    className="text-gray-700 font-medium hover:text-blue-600 transition-colors"
                  >
                    kudaon@daum.net
                  </a>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-blue-600 tracking-wider mb-1 uppercase">
                    TEL
                  </span>
                  <a
                    href="tel:02-425-5800"
                    className="text-gray-700 font-medium hover:text-blue-600 transition-colors"
                  >
                    02-425-5800
                  </a>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-blue-600 tracking-wider mb-1 uppercase">
                    OFFICE
                  </span>
                  <p className="text-gray-700 font-medium leading-snug">
                    경기도 고양시 덕양구 삼원로 73, 1020호
                  </p>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-blue-600 tracking-wider mb-1 uppercase">
                    WEBSITE
                  </span>
                  <a
                    href="https://www.kuda.or.kr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 font-medium hover:text-blue-600 transition-colors"
                  >
                    www.kuda.or.kr
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form Card */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-bold text-gray-900 pb-4 border-b border-gray-100">
                문의 작성
              </h2>

              {submitted ? (
                <div className="text-center py-14 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">문의가 정상 접수되었습니다!</h3>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                    남겨주신 이메일로 담당자가 검토 후 순차적으로 회신드리겠습니다.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-sm cursor-pointer"
                  >
                    추가 문의 작성
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  {error && (
                    <div className="p-3.5 rounded-xl bg-red-50 text-red-600 text-xs sm:text-sm border border-red-100">
                      {error}
                    </div>
                  )}

                  {/* Name Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
                    <label
                      htmlFor="name"
                      className="sm:col-span-3 text-sm font-bold text-gray-800"
                    >
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <div className="sm:col-span-9">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="이름을 입력하세요"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition bg-white"
                      />
                    </div>
                  </div>

                  {/* Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-start">
                    <label
                      htmlFor="email"
                      className="sm:col-span-3 text-sm font-bold text-gray-800 pt-2.5"
                    >
                      이메일 <span className="text-red-500">*</span>
                    </label>
                    <div className="sm:col-span-9 space-y-1.5">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@email.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition bg-white"
                      />
                      <p className="text-xs text-gray-400 pl-1">
                        답변을 받으실 이메일 주소를 정확히 입력해주세요.
                      </p>
                    </div>
                  </div>

                  {/* Message Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-start">
                    <label
                      htmlFor="message"
                      className="sm:col-span-3 text-sm font-bold text-gray-800 pt-2.5"
                    >
                      내용 <span className="text-red-500">*</span>
                    </label>
                    <div className="sm:col-span-9">
                      <textarea
                        id="message"
                        name="message"
                        rows={7}
                        required
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="문의하실 내용을 구체적으로 작성해주세요."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition bg-white resize-y leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 flex justify-center">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="min-w-[140px] px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                    >
                      {isSubmitting ? '처리 중...' : '문의하기'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
