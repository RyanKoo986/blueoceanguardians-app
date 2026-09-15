import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Send, CheckCircle, Upload, X } from 'lucide-react';
import { reportService } from '../../services/reportService';

export default function Report() {
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
    const url = (form.elements.namedItem('url') as HTMLInputElement).value;
    const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;

    try {
      await reportService.createReport({ url, description, files });
      setSubmitted(true);
      form.reset();
      setFiles([]);
    } catch (error) {
      alert('제보 제출에 실패했습니다. 다시 시도해주세요.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Helmet>
        <title>오류 정보 제보 - Blue Guardians</title>
        <meta
          name="description"
          content="웹사이트나 SNS에서 발견한 독도 관련 잘못된 정보를 제보해주세요. 여러분의 제보가 올바른 역사를 만듭니다."
        />
      </Helmet>

      <div className="relative z-10">
        {/* Standardized Hero Section */}
        <section className="relative h-[40vh] flex items-center justify-center overflow-hidden pt-20">
          <div className="absolute inset-0 z-0">
            <img
              src="/images/dokdo photo/KakaoTalk_20250615_182418407.jpg"
              alt="Dokdo Divers"
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
          <div className="absolute inset-0 bg-black/40 z-10" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-wider font-serif">
              오류 정보 제보
            </h1>
            <p className="text-lg text-gray-200 tracking-wide font-light">
              여러분의 제보가 올바른 역사를 만듭니다
            </p>
          </div>
        </section>

        {/* Form Container */}
        <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 w-full">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-red-500 font-bold tracking-wider uppercase mb-3 block">
                Reporting System
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                잘못된 정보를 발견하셨나요?
              </h2>
              <p className="text-gray-600 leading-relaxed">
                웹사이트나 SNS에서 발견한 독도 관련 오류 제보는<br />
                올바른 역사를 바로 세우는 중요한 첫걸음입니다.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-8 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <i className="ri-alarm-warning-line text-red-500"></i>
                  오류 제보 작성
                </h3>
              </div>

              {submitted ? (
                <div className="text-center py-20 px-8">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-green-600" size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    제보가 접수되었습니다
                  </h2>
                  <p className="text-gray-600 mb-8">
                    소중한 제보 감사합니다. 검토 후 빠르게 조치하겠습니다.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                  >
                    추가 제보하기
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-0">
                  <div className="border-b border-gray-200">
                    {/* URL Input */}
                    <div className="grid grid-cols-12 border-b border-gray-100">
                      <div className="col-span-12 md:col-span-3 bg-gray-50 px-6 py-4 flex items-center border-r-0 md:border-r border-gray-100">
                        <label className="text-sm font-bold text-gray-700">
                          발견한 URL <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <div className="col-span-12 md:col-span-9 p-4">
                        <input
                          type="url"
                          name="url"
                          required
                          placeholder="https://example.com/article..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm"
                        />
                      </div>
                    </div>

                    {/* Files Input */}
                    <div className="grid grid-cols-12 border-b border-gray-100">
                      <div className="col-span-12 md:col-span-3 bg-gray-50 px-6 py-4 flex items-center border-r-0 md:border-r border-gray-100">
                        <label className="text-sm font-bold text-gray-700">
                          증거 자료
                        </label>
                      </div>
                      <div className="col-span-12 md:col-span-9 p-4">
                        <div className="flex items-center gap-4">
                          <label
                            htmlFor="report-file-upload"
                            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors shadow-sm"
                          >
                            <Upload size={16} />
                            파일 선택
                          </label>
                          <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            id="report-file-upload"
                          />
                          <span className="text-xs text-gray-500">
                            이미지(PNG, JPG) 및 문서 파일 업로드 가능
                          </span>
                        </div>

                        {files.length > 0 && (
                          <div className="mt-4 space-y-2 bg-gray-50 p-3 rounded-md border border-gray-200">
                            {files.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 text-sm"
                              >
                                <span className="text-gray-600 truncate">
                                  {file.name}
                                </span>
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

                    {/* Description Input */}
                    <div className="grid grid-cols-12">
                      <div className="col-span-12 md:col-span-3 bg-gray-50 px-6 py-4 flex items-start border-r-0 md:border-r border-gray-100">
                        <label className="text-sm font-bold text-gray-700 pt-2">
                          오류 내용 <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <div className="col-span-12 md:col-span-9 p-4">
                        <textarea
                          name="description"
                          required
                          rows={8}
                          placeholder="어떤 부분이 잘못되었나요? 자세히 설명해주세요."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-center">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-12 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold rounded-md shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? '전송 중...' : (
                        <>
                          <Send size={18} />
                          제보하기
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
