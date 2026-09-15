import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FooterSection() {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <footer className="relative py-20 mt-0 bg-slate-100 border-t border-slate-200">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-12">
            
            {/* Navigation Links */}
            <div className="flex flex-wrap justify-center gap-8 text-sm font-medium">
              <Link 
                to="/about"
                className="text-gray-500 hover:text-brand-cyan-600 transition-colors duration-300 cursor-pointer"
              >
                About
              </Link>
              <Link
                to="/services/cleanup"
                className="text-gray-500 hover:text-brand-cyan-600 transition-colors duration-300 cursor-pointer"
              >
                Services
              </Link>
              <Link 
                to="/archive"
                className="text-gray-500 hover:text-brand-cyan-600 transition-colors duration-300 cursor-pointer"
              >
                Archive
              </Link>
              <button 
                onClick={() => {
                  if (window.location.pathname !== '/') {
                    window.location.href = '/#contact';
                  } else {
                    scrollToSection('contact');
                  }
                }}
                className="text-gray-500 hover:text-brand-cyan-600 transition-colors duration-300 cursor-pointer"
              >
                Contact Us
              </button>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center justify-center space-x-8">
              <a
                href="https://www.instagram.com/kudaon1979/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="대한잠수협회 인스타그램"
                className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-brand-cyan-600 transition-colors duration-300 cursor-pointer bg-white rounded-full shadow-sm border border-gray-100 hover:border-brand-cyan-200 hover:shadow-md"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://blog.naver.com/kudaon1979"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="대한잠수협회 네이버 블로그"
                className="w-12 h-12 flex items-center justify-center transition-all duration-300 cursor-pointer bg-white rounded-full shadow-sm border border-gray-100 hover:border-[#03C75A] hover:shadow-md"
              >
                <span className="font-black text-lg leading-none text-[#03C75A]">N</span>
              </a>
            </div>

            {/* Contact Info */}
            <div className="text-sm text-gray-500 space-y-1.5 leading-relaxed">
              <p>주소 : 경기도 고양시 덕양구 삼원로 73, 1020호</p>
              <p>연락처 : 02-425-5800</p>
              <p>
                E-Mail :{' '}
                <a
                  href="mailto:kudaon@daum.net"
                  className="hover:text-brand-cyan-600 transition-colors duration-300"
                >
                  kudaon@daum.net
                </a>
              </p>
              <p>
                인터넷 홈페이지 :{' '}
                <a
                  href="https://www.kuda.or.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-cyan-600 transition-colors duration-300"
                >
                  www.kuda.or.kr
                </a>
              </p>
              <p>연혁 : 1979.01.31 사단법인 대한잠수협회 창립</p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

            {/* Copyright and Legal Links */}
            <div className="flex flex-col space-y-2">
              <span className="text-gray-400 text-sm">© 2024 Project Dokdo. All rights reserved.</span>
              <div className="flex justify-center space-x-4 text-sm text-gray-500">
                <button 
                  onClick={() => setShowPrivacyModal(true)}
                  className="hover:text-brand-cyan-600 transition-colors duration-300 cursor-pointer"
                >
                  개인정보처리방침
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPrivacyModal(false)}
          >
            <motion.div
              className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-slate-800 px-6 py-4 border-b border-white/10 flex justify-between items-center sticky top-0 z-10">
                <h2 className="text-xl font-bold text-white">개인정보처리방침</h2>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6 text-gray-300 leading-relaxed">
                <p>
                  <strong>Project Dokdo</strong>(이하 "본 플랫폼")는 사용자의 개인정보를 중요시하며, 
                  "정보통신망 이용촉진 및 정보보호"에 관한 법률을 준수하고 있습니다.
                </p>
                
                <div>
                  <h3 className="text-white font-bold mb-2">1. 수집하는 개인정보 항목</h3>
                  <p>본 플랫폼은 회원가입, 공모전 참여, 제보 시스템 이용 등을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                    <li>수집항목: 이름, 이메일 주소, 비밀번호, 접속 로그, 접속 IP 정보</li>
                    <li>개인정보 수집방법: 서비스 내 화면(회원가입, 게시판, 공모전 접수)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2">2. 개인정보의 수집 및 이용목적</h3>
                  <p>수집한 개인정보를 다음의 목적을 위해 활용합니다.</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                    <li>서비스 제공에 관한 계약 이행 및 콘텐츠 제공</li>
                    <li>회원 관리: 회원제 서비스 이용에 따른 본인확인, 개인식별, 불량회원의 부정 이용 방지</li>
                    <li>공모전 운영: 독도 수중 사진 공모전 접수 및 심사, 수상자 연락</li>
                    <li>공공 캠페인: 대한잠수협회(KUDA)와의 협력을 통한 독도 인식 개선 활동</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2">3. 개인정보의 보유 및 이용기간</h3>
                  <p>원칙적으로, 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 아래와 같이 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
