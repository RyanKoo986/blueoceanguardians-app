import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';

export function FooterSection() {
  return (
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
            <Link 
              to="/contact"
              className="text-gray-500 hover:text-brand-cyan-600 transition-colors duration-300 cursor-pointer"
            >
              Contact
            </Link>
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
            <span className="text-gray-400 text-sm">© {new Date().getFullYear()} Blue Guardians. All rights reserved.</span>
            <div className="flex justify-center space-x-4 text-sm text-gray-500">
              <Link to="/privacy" className="hover:text-brand-cyan-600 transition-colors duration-300">
                개인정보처리방침
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
