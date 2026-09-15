import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Lazy load components
const HomePage = lazy(() => import('../pages/home/page'));
const Login = lazy(() => import('../pages/Login'));
const Signup = lazy(() => import('../pages/Signup'));
const ArchivePage = lazy(() => import('../pages/archive/page'));
const Cleanup = lazy(() => import('../pages/services/Cleanup'));
const AIFactCheck = lazy(() => import('../pages/services/AIFactCheck'));
const Report = lazy(() => import('../pages/services/Report'));
const About = lazy(() => import('../pages/About'));
const MyPage = lazy(() => import('../pages/MyPage'));
const Contact = lazy(() => import('../pages/Contact'));
const Contest = lazy(() => import('../pages/services/Contest'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const PrivacyPage = lazy(() => import('../pages/Privacy'));

// Fallback component for missing pages
const PlaceholderPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4 text-center">
    <h1 className="text-3xl font-bold mb-4">페이지 준비 중</h1>
    <p className="text-gray-400 max-w-md">
      요청하신 페이지는 현재 준비 중이거나 업데이트가 진행 중입니다. 메인 페이지를 이용해 주세요.
    </p>
    <a href="/" className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition">
      홈으로 돌아가기
    </a>
  </div>
);

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <HomePage />
      </Suspense>
    ),
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/signup',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Signup />
      </Suspense>
    ),
  },
  {
    path: '/archive',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ArchivePage />
      </Suspense>
    ),
  },
  {
    path: '/services/cleanup',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Cleanup />
      </Suspense>
    ),
  },
  {
    path: '/services/ai-fact-check',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <AIFactCheck />
      </Suspense>
    ),
  },
  {
    path: '/services/report',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Report />
      </Suspense>
    ),
  },
  {
    path: '/about',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <About />
      </Suspense>
    ),
  },
  {
    path: '/mypage',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <MyPage />
      </Suspense>
    ),
  },
  {
    path: '/services/contest',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Contest />
      </Suspense>
    ),
  },
  {
    path: '/contact',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Contact />
      </Suspense>
    ),
  },
  {
    path: '/privacy',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <PrivacyPage />
      </Suspense>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/admin',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminDashboard />
          </Suspense>
        ),
      },
      {
        path: '/admin/form',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminDashboard />
          </Suspense>
        ),
      },
      {
        path: '/admin/report',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminDashboard />
          </Suspense>
        ),
      },
      {
        path: '/admin/cleanup',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminDashboard />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <HomePage />
      </Suspense>
    ),
  },
];

export default routes;
