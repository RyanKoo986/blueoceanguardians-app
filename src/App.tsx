import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import Header from './components/feature/Header';
import { BottomTabBar } from './components/navigation/BottomTabBar';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from './components/common/ScrollToTop';

import { FooterSection } from './pages/home/components/FooterSection';
import { ContestPromo } from './components/feature/ContestPromo';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <ScrollToTop />
            <div className="min-h-screen bg-gray-900 dark:bg-gray-900 transition-colors duration-300 flex flex-col">
              <Header />
              <main className="flex-grow">
                <AppRoutes />
              </main>
              <ContestPromo />
              <FooterSection />
              <BottomTabBar />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

export default App;
