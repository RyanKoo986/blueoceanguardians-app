import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ChevronLeft, Home, Trophy, Send } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isLightPage = ['/contact', '/login', '/signup', '/mypage'].includes(location.pathname) || location.pathname.startsWith('/admin');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setActiveDropdown(null);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  const toggleDropdown = (idx: number) => {
    setActiveDropdown(activeDropdown === idx ? null : idx);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      closeMenu();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMenu();
  };

  const getPageTitle = (pathname: string) => {
    if (pathname === '/about') return 'About';
    if (pathname === '/services/cleanup') return '수중 정화 제보';
    if (pathname === '/services/contest') return '수중사진 공모전';
    if (pathname === '/services/ai-fact-check') return 'AI 팩트체크';
    if (pathname === '/services/report') return '오류 정보 제보';
    if (pathname === '/archive') return '독도 아카이브';
    if (pathname === '/contact') return '문의하기';
    if (pathname === '/login') return '로그인';
    if (pathname === '/signup') return '회원가입';
    if (pathname === '/mypage') return '마이페이지';
    if (pathname.startsWith('/admin')) return '관리자 대시보드';
    return 'Blue Guardians';
  };

  // Project Dokdo menu structure
  interface MenuItem {
    id?: string;
    label: string;
    type?: 'scroll' | 'dropdown';
    to?: string;
    dropdown?: { to: string; label: string }[];
  }

  const menuItems: MenuItem[] = [
    { to: "/about", label: "About" },
    { 
      label: "Services", 
      type: "dropdown",
      dropdown: [
        { to: "/services/cleanup", label: "수중정화" },
        { to: "/services/contest", label: "수중사진 공모전" },
        { to: "/services/ai-fact-check", label: "AI 정보 정정 시스템" },
        { to: "/services/report", label: "오류 정보 제보" },
      ]
    },
    { 
      label: "Archive", 
      type: "dropdown",
      dropdown: [
        { to: "/archive?tab=notice", label: "공지사항" },
        { to: "/archive?tab=dokdo", label: "독도 자료" },
        { to: "/archive?tab=cleanup", label: "수중 정화 활동" },
      ]
    },
  ];

  const isHeaderWhite = isScrolled || isLightPage;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          isHeaderWhite
            ? "border-gray-200 shadow-sm"
            : "border-transparent"
        }`}
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)',
          backgroundColor: isHeaderWhite
            ? 'rgba(255, 255, 255, 0.96)'
            : 'transparent',
          backdropFilter: isHeaderWhite ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: isHeaderWhite ? 'blur(16px)' : 'none',
          backgroundImage: !isHeaderWhite
            ? 'linear-gradient(to bottom, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0) 100%)'
            : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Native App Bar (Visible on < lg) */}
          <div className="flex lg:hidden justify-between items-center h-14">
            {isHome ? (
              <>
                {/* Home: Brand Logo */}
                <div className="flex items-center gap-2">
                  <Link to="/" className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                      isHeaderWhite ? "bg-blue-600 shadow-[0_0_8px_#2563eb]" : "bg-white shadow-[0_0_8px_#ffffff]"
                    }`} />
                    <span className={`text-base font-extrabold tracking-tight ${
                      isHeaderWhite ? "text-blue-600" : "text-white drop-shadow-sm"
                    }`}>
                      Blue Guardians
                    </span>
                  </Link>
                </div>

                {/* Home Right: Quick Action & Hamburger */}
                <div className="flex items-center gap-2">
                  <Link
                    to="/services/contest"
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold active:scale-95 transition-transform ${
                      isHeaderWhite
                        ? "bg-blue-50 border border-blue-200 text-blue-600"
                        : "bg-white/10 border border-white/20 text-white"
                    }`}
                  >
                    <Trophy size={13} className={isHeaderWhite ? "text-amber-500" : "text-amber-300"} />
                    <span>공모전</span>
                  </Link>
                  <button
                    type="button"
                    onClick={toggleMenu}
                    className={`p-2 rounded-xl transition-all flex items-center justify-center active:scale-90 ${
                      isHeaderWhite
                        ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                    aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
                  >
                    {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Subpage: Native Back Button */}
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className={`flex items-center gap-1 -ml-2 px-2 py-1.5 rounded-lg active:scale-90 transition-all ${
                    isHeaderWhite ? "text-gray-900 hover:text-black" : "text-white hover:text-white/80"
                  }`}
                  aria-label="뒤로 가기"
                >
                  <ChevronLeft size={24} color={isHeaderWhite ? "#111827" : "#ffffff"} />
                  <span className="text-xs font-semibold">뒤로</span>
                </button>

                {/* Subpage Title */}
                <h1 className={`text-sm sm:text-base font-bold truncate max-w-[200px] text-center ${
                  isHeaderWhite ? "text-gray-900" : "text-white drop-shadow-sm"
                }`}>
                  {getPageTitle(location.pathname)}
                </h1>

                {/* Subpage Right: Menu */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={toggleMenu}
                    className={`p-2 rounded-xl active:scale-90 transition-all ${
                      isHeaderWhite 
                        ? "text-gray-800 hover:bg-gray-100" 
                        : "text-white hover:bg-white/10"
                    }`}
                    aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
                  >
                    {isMenuOpen ? (
                      <X size={20} color={isHeaderWhite ? "#111827" : "#ffffff"} />
                    ) : (
                      <Menu size={20} color={isHeaderWhite ? "#111827" : "#ffffff"} />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Desktop Navigation (Visible on lg+) */}
          <div className="hidden lg:flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                to="/"
                className="group flex items-center"
                onClick={closeMenu}
              >
                <span className={`text-lg sm:text-xl font-extrabold transition-colors ${
                  isHeaderWhite
                    ? "text-blue-600 hover:text-blue-700"
                    : "text-brand-cyan-400 text-glow hover:text-white"
                }`}>
                  Blue Guardians
                </span>
              </Link>
            </div>

            {/* Desktop Navigation - Center */}
            <nav className="flex items-center space-x-0.5 lg:space-x-1 flex-1 justify-center min-w-0">
              {menuItems.map((item, idx) => (
                <div key={idx} className="relative group flex-shrink-0">
                  {item.type === 'scroll' ? (
                    <button
                      onClick={() => scrollToSection(item.id!)}
                      className={`relative px-2 lg:px-4 py-2 text-xs lg:text-sm font-semibold transition-all duration-300 rounded-lg overflow-hidden whitespace-nowrap
                        ${
                          isHeaderWhite
                            ? "text-gray-800 hover:text-blue-600 hover:bg-gray-100/60"
                            : "text-white/90 hover:text-brand-cyan-400 hover:bg-white/5"
                        }
                      `}
                    >
                      <span className="relative z-10">{item.label}</span>
                    </button>
                  ) : item.type === 'dropdown' ? (
                    <div className="relative group">
                      <button
                         className={`relative px-2 lg:px-4 py-2 text-xs lg:text-sm font-semibold transition-all duration-300 rounded-lg overflow-hidden whitespace-nowrap
                          ${
                            isHeaderWhite
                              ? "text-gray-800 hover:text-blue-600 hover:bg-gray-100/60"
                              : "text-white/90 hover:text-brand-cyan-400 hover:bg-white/5"
                          }
                        `}
                      >
                        <span className="relative z-10">{item.label}</span>
                      </button>
                      <div className={`absolute top-full left-0 mt-2 w-48 shadow-2xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 py-2 border ${
                        isHeaderWhite 
                          ? "bg-white/95 backdrop-blur-xl border-gray-200" 
                          : "bg-gray-900/95 backdrop-blur-xl border-brand-cyan-500/30"
                      }`}>
                        {item.dropdown?.map((sub, subIdx) => (
                          <Link
                            key={subIdx}
                            to={sub.to}
                            className={`block px-4 py-3 text-sm transition-all duration-300 relative overflow-hidden ${
                              isHeaderWhite
                                ? "text-gray-700 hover:text-blue-600 hover:bg-gray-100 hover:pl-6"
                                : "text-gray-200 hover:text-brand-cyan-400 hover:bg-white/5 hover:pl-6"
                            }`}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.to!}
                      className={`relative px-2 lg:px-4 py-2 text-xs lg:text-sm font-semibold transition-all duration-300 rounded-lg overflow-hidden whitespace-nowrap
                        ${
                          isHeaderWhite
                            ? "text-gray-800 hover:text-blue-600 hover:bg-gray-100/60"
                            : "text-white/90 hover:text-brand-cyan-400 hover:bg-white/5"
                        }
                      `}
                    >
                      <span className="relative z-10">{item.label}</span>
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Auth Navigation (PC) - Right Side */}
            <nav className={`flex items-center space-x-1 ml-4 border-l pl-4 flex-shrink-0 ${
              isHeaderWhite ? "border-gray-300" : "border-gray-200/20"
            }`}>
              {isAuthenticated ? (
                <>
                  {user?.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      className={`relative px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg overflow-hidden whitespace-nowrap
                        ${isHeaderWhite ? "text-gray-800 hover:text-blue-600" : "text-white/90 hover:text-brand-cyan-400"}
                      `}
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/mypage"
                    className={`relative px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg overflow-hidden whitespace-nowrap
                      ${isHeaderWhite ? "text-gray-800 hover:text-blue-600" : "text-white/90 hover:text-brand-cyan-400"}
                    `}
                  >
                    My Page
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`relative px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg overflow-hidden whitespace-nowrap
                      ${isHeaderWhite ? "text-gray-800 hover:text-blue-600" : "text-white/90 hover:text-brand-cyan-400"}
                    `}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`relative px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg overflow-hidden whitespace-nowrap
                      ${isHeaderWhite ? "text-gray-800 hover:text-blue-600" : "text-white/90 hover:text-brand-cyan-400"}
                    `}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className={`relative px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg overflow-hidden whitespace-nowrap
                      ${isHeaderWhite ? "text-gray-800 hover:text-blue-600" : "text-white/90 hover:text-brand-cyan-400"}
                    `}
                  >
                    Signup
                  </Link>
                </>
              )}

              <Link
                to="/contact"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all ml-2"
              >
                <Send size={13} />
                <span>Contact</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Full Screen Navigation Menu (Mobile Drawer) */}
      <nav
        className={`fixed inset-0 z-[55] transition-all duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div
          className={`absolute inset-0 transition-transform duration-500 ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{
            background: 'linear-gradient(135deg, #030712 0%, #0a1128 50%, #08213e 100%)',
            backgroundColor: '#030712',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        />

        {/* Close button inside mobile menu */}
        <button
          type="button"
          onClick={closeMenu}
          className="absolute top-5 right-5 z-20 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all active:scale-90"
          aria-label="메뉴 닫기"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Menu Content */}
        <div
          className={`relative h-full flex flex-col justify-center items-center px-6 transition-all duration-500 delay-100 ${
            isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <ul className="text-center space-y-4 max-w-sm w-full">
            {menuItems.map((item, idx) => (
              <li key={idx} className="overflow-visible">
                {item.type === 'dropdown' ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => toggleDropdown(idx)}
                      className={`w-full flex items-center justify-center gap-2 text-2xl font-bold transition-all ${
                        activeDropdown === idx ? "text-cyan-400" : "text-white"
                      }`}
                      style={{ color: activeDropdown === idx ? '#22d3ee' : '#ffffff' }}
                    >
                      <span>{item.label}</span>
                      <span className={`text-xs transition-transform ${activeDropdown === idx ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    {activeDropdown === idx && (
                      <div className="py-2 space-y-3">
                        {item.dropdown?.map((sub, subIdx) => (
                          <Link
                            key={subIdx}
                            to={sub.to}
                            onClick={closeMenu}
                            className="block text-base font-medium transition-colors hover:text-cyan-400 py-1"
                            style={{ color: '#cbd5e1' }}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.to!}
                    onClick={closeMenu}
                    className="block text-2xl font-bold hover:text-cyan-400 transition-colors py-1"
                    style={{ color: '#ffffff' }}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}

            <div className="w-3/4 mx-auto h-px bg-white/10 my-4" />

            {/* Auth Links */}
            {isAuthenticated ? (
              <div className="flex justify-center gap-3 pt-2">
                <Link
                  to="/mypage"
                  onClick={closeMenu}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-bold transition-all active:scale-95 shadow-sm"
                  style={{ color: '#ffffff' }}
                >
                  마이페이지
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-sm font-bold transition-all active:scale-95 shadow-sm"
                  style={{ color: '#fca5a5' }}
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex justify-center gap-3 pt-2">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold transition-all active:scale-95 shadow-md"
                  style={{ color: '#ffffff' }}
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-bold transition-all active:scale-95 shadow-sm"
                  style={{ color: '#ffffff' }}
                >
                  회원가입
                </Link>
              </div>
            )}
          </ul>
        </div>
      </nav>
    </>
  );
}

export default Header;
