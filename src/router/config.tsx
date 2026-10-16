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
const TermsPage = lazy(() => import('../pages/Terms'));
const AccountDeletionPage = lazy(() => import('../pages/AccountDeletion'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));

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
    path: '/reset-password',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ResetPassword />
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
    path: '/terms',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <TermsPage />
      </Suspense>
    ),
  },
  {
    path: '/account-deletion',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <AccountDeletionPage />
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
