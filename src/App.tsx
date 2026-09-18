import { BrowserRouter, useLocation } from 'react-router-dom';
import { AppRoutes } from './router';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import Header from './components/feature/Header';
import { BottomTabBar } from './components/navigation/BottomTabBar';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from './components/common/ScrollToTop';
import FloatingScrollToTop from './components/common/FloatingScrollToTop';
import { FooterSection } from './pages/home/components/FooterSection';
import { ContestPromo } from './components/feature/ContestPromo';

function AppShell() {
  const location = useLocation();
  const isLightPage = [
    '/contact',
    '/admin',
    '/login',
    '/signup',
    '/reset-password',
    '/mypage',
    '/privacy',
  ].some((path) => location.pathname === path || location.pathname.startsWith(path));

  return (
    <div
      className={`min-h-screen transition-colors duration-300 flex flex-col ${
        isLightPage ? 'bg-gray-50 text-gray-900' : 'bg-brand-navy-950 text-white'
      }`}
    >
      <Header />
      <main className="flex-grow">
        <AppRoutes />
      </main>
      <ContestPromo />
      <FooterSection />
      <FloatingScrollToTop />
      <BottomTabBar />
    </div>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <ScrollToTop />
            <AppShell />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

export default App;
