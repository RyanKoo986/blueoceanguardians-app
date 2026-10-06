import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Send, CheckCircle, Upload, X } from 'lucide-react';

import { cleanupService } from '../../services/cleanupService';
import { failedUploadMessage } from '../../lib/storageUpload';

export default function Cleanup() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const contact = (form.elements.namedItem('contact') as HTMLInputElement).value;
    const region = (form.elements.namedItem('region') as HTMLInputElement).value;
    const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value;

    try {
      const failedFiles = await cleanupService.createCleanup({ name, contact, region, message, files });
      if (failedFiles.length) alert(failedUploadMessage(failedFiles));
      setSubmitted(true);
      form.reset();
      setFiles([]);
    } catch (error) {
      alert('신청 제출에 실패했습니다. 다시 시도해주세요.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Helmet>
        <title>수중정화 참여 신청 - Blue Guardians</title>
        <meta name="description" content="독도 수중정화 활동에 참여를 신청하세요. 깨끗한 독도 바다를 함께 지켜요." />
      </Helmet>

      <div className="relative z-10">
        {/* Standardized Hero Section */}
        <section className="relative h-[40vh] flex items-center justify-center overflow-hidden pt-20">
          <div className="absolute inset-0 z-0">
            <img
                src="/images/dokdo photo/KakaoTalk_20250615_073514603_01.jpg"
                alt="수중정화 활동"
                className="w-full h-full object-cover"
                loading="eager"
            />
          </div>
          <div className="absolute inset-0 bg-black/40 z-10" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-wider font-serif">
              수중정화 참여 신청
            </h1>
            <p className="text-lg text-gray-200 tracking-wide font-light">
               여러분의 참여가 깨끗한 독도 바다를 만듭니다
            </p>
          </div>
        </section>

        <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 w-full">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-blue-600 font-bold tracking-wider uppercase mb-3 block">Cleanup Program</span>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                독도 수중정화에 함께해요
              </h2>
              <p className="text-gray-600 leading-relaxed">
                대한잠수협회(KUDA)와 함께하는 독도 수중정화 활동에<br />
                누구나 참여를 신청할 수 있습니다.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="bg-gray-50 px-8 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <i className="ri-hand-heart-line text-blue-600"></i>
                    참여 신청 작성
                </h3>
             </div>

            {submitted ? (
              <div className="text-center py-20 px-8">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="text-green-600" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">참여 신청이 접수되었습니다</h2>
                <p className="text-gray-600 mb-8">
                  소중한 참여 감사합니다. 확인 후 개별적으로 연락드리겠습니다.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                >
                  추가 신청하기
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-0">
                  <div className="border-b border-gray-200">
                     {/* Name Input */}
                     <div className="grid grid-cols-12 border-b border-gray-100">
                        <div className="col-span-12 md:col-span-3 bg-gray-50 px-6 py-4 flex items-center border-r-0 md:border-r border-gray-100">
                            <label className="text-sm font-bold text-gray-700">이름 <span className="text-red-500">*</span></label>
                        </div>
                        <div className="col-span-12 md:col-span-9 p-4">
                             <input
                                type="text"
                                name="name"
                                required
                                placeholder="신청자 이름"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>
                     </div>

                     {/* Contact Input */}
                     <div className="grid grid-cols-12 border-b border-gray-100">
                        <div className="col-span-12 md:col-span-3 bg-gray-50 px-6 py-4 flex items-center border-r-0 md:border-r border-gray-100">
                            <label className="text-sm font-bold text-gray-700">연락처 <span className="text-red-500">*</span></label>
                        </div>
                        <div className="col-span-12 md:col-span-9 p-4">
                             <input
                                type="text"
                                name="contact"
                                required
                                placeholder="연락 가능한 전화번호 또는 이메일"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>
                     </div>

                     {/* Region / Schedule Input */}
                     <div className="grid grid-cols-12 border-b border-gray-100">
                        <div className="col-span-12 md:col-span-3 bg-gray-50 px-6 py-4 flex items-center border-r-0 md:border-r border-gray-100">
                            <label className="text-sm font-bold text-gray-700">희망 지역 / 일정</label>
                        </div>
                        <div className="col-span-12 md:col-span-9 p-4">
                             <input
                                type="text"
                                name="region"
                                placeholder="예: 독도 동도, 6월 중 주말 희망 (선택)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>
                     </div>

                     {/* Evidence File Input */}
                     <div className="grid grid-cols-12 border-b border-gray-100">
                        <div className="col-span-12 md:col-span-3 bg-gray-50 px-6 py-4 flex items-center border-r-0 md:border-r border-gray-100">
                            <label className="text-sm font-bold text-gray-700">사진 첨부</label>
                        </div>
                        <div className="col-span-12 md:col-span-9 p-4">
                             <div className="flex items-center gap-4">
                                <label
                                  htmlFor="cleanup-file-upload"
                                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors shadow-sm"
                                >
                                  <Upload size={16} />
                                  파일 선택
                                </label>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*,video/*"
                                  onChange={handleFileChange}
                                  className="hidden"
                                  id="cleanup-file-upload"
                                />
                                <span className="text-xs text-gray-500">이미지 / 영상 파일 업로드 가능 (선택, 파일당 최대 50MB)</span>
                             </div>

                             {files.length > 0 && (
                                <div className="mt-4 space-y-2 bg-gray-50 p-3 rounded-md border border-gray-200">
                                {files.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 text-sm">
                                    <span className="text-gray-600 truncate">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFile(index)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                    </div>
                                ))}
                                </div>
                             )}
                        </div>
                     </div>

                     {/* Message Input */}
                     <div className="grid grid-cols-12">
                        <div className="col-span-12 md:col-span-3 bg-gray-50 px-6 py-4 flex items-start border-r-0 md:border-r border-gray-100">
                            <label className="text-sm font-bold text-gray-700 pt-2">신청 내용 <span className="text-red-500">*</span></label>
                        </div>
                        <div className="col-span-12 md:col-span-9 p-4">
                             <textarea
                                name="message"
                                required
                                rows={8}
                                placeholder="참여 동기, 잠수 경력, 문의 사항 등을 자유롭게 작성해주세요."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                            />
                        </div>
                     </div>
                  </div>

                  <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-center">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-12 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-md shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? '전송 중...' : (
                        <>
                          <Send size={18} />
                          참여 신청하기
                        </>
                      )}
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
