import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { TestLayout } from '@/components/layouts/TestLayout';
import { Suspense, lazy, useState, useEffect } from 'react';
import React from 'react';
import { useAppSelector } from '@/redux/hooks';

// Public pages
const HomePage = lazy(() => import('@/pages/public/HomePage'));
const TestsPage = lazy(() =>
  import('@/pages/public/TestsPage').then((m) => {
    return { default: m.TestsPage || m.default };
  })
);
const NotFoundPage = lazy(() =>
  import('@/pages/public/NotFoundPage').then((m) => {
    return { default: m.NotFoundPage || m.default };
  })
);
const UnauthorizedPage = lazy(() =>
  import('@/pages/public/UnauthorizedPage').then((m) => {
    return { default: m.UnauthorizedPage || m.default };
  })
);

// Test pages
const TestScreen = lazy(() => import('@/pages/test/TestScreen'));
const TestResultPage = lazy(() => import('@/pages/test/TestResultPage'));
const TestNotFoundPage = lazy(() => import('@/pages/protected/test/TestNotFoundPage'));
const TestReferencePage = lazy(() => import('@/pages/test/TestReferencePage'));
const TestHistoryPage = lazy(() => import('@/pages/protected/test/TestHistoryPage'));

// Auth pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() =>
  import('@/pages/auth/RegisterPage').then((m) => {
    return { default: m.RegisterPage || m.default };
  })
);
const ForgotPasswordPage = lazy(() =>
  import('@/pages/auth/ForgotPasswordPage').then((m) => {
    return { default: m.ForgotPasswordPage || m.default };
  })
);
const ChangePasswordPage = lazy(() =>
  import('@/pages/auth/ChangePasswordPage').then((m) => {
    return { default: m.ChangePasswordPage || m.default };
  })
);

// Protected user pages
const ProfilePage = lazy(() =>
  import('@/pages/protected/ProfilePage').then((m) => {
    return { default: m.ProfilePage || m.default };
  })
);

// Suspense wrappers
const SuspenseWrapper = ({
  component: Component,
}: {
  component: React.ComponentType<any>;
}) => (
  <Suspense
    fallback={
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center p-4">
          <div className="h-8 w-8 rounded-full bg-blue-200 dark:bg-blue-700 mb-2"></div>
          <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    }
  >
    <Component />
  </Suspense>
);

// Loading Spinner Component
const LoadingSpinner = ({ message = "Redirecting..." }: { message?: string }) => (
  <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <div className="relative">
      {/* Outer spinning ring */}
      <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin"></div>
      {/* Inner spinning ring */}
      <div className="absolute top-2 left-2 w-12 h-12 border-4 border-t-blue-600 dark:border-t-blue-400 border-transparent rounded-full animate-spin"></div>
      {/* Center dot */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
    </div>
    <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm font-medium animate-pulse">
      {message}
    </p>
  </div>
);

// RequireAuth guard with loading state
const RequireAuth = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !isRedirecting) {
      setIsRedirecting(true);
      // Add a small delay to show the loading state
      const timer = setTimeout(() => {
        // The navigation will happen automatically
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isRedirecting]);

  if (!isAuthenticated) {
    if (!isRedirecting) {
      return <LoadingSpinner message="Checking authentication..." />;
    }
    return (
      <Navigate to="/auth/login" replace state={{ from: window.location.pathname }} />
    );
  }
  
  return children;
};

// Logout handler
const LogoutHandler = () => {
  React.useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    window.location.href = '/auth/login';
  }, []);
  return <div className="p-8 text-center">Logging out...</div>;
};

const AppRoutes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      // Public routes under MainLayout
      {
        index: true,
        element: <SuspenseWrapper component={HomePage} />,
      },
      {
        path: 'tests',
        element: <SuspenseWrapper component={TestsPage} />,
      },
      // Test Result routes under MainLayout
      {
        path: 'test-results/:examId',
        element: <SuspenseWrapper component={TestResultPage} />,
      },
      {
        path: 'test-history',
        element: <RequireAuth><SuspenseWrapper component={TestHistoryPage} /></RequireAuth>,
      },

      // Protected user routes under MainLayout
      {
        path: 'profile',
        element: <RequireAuth><SuspenseWrapper component={ProfilePage} /></RequireAuth>,
      },

      // Logout route under MainLayout
      {
        path: 'logout',
        element: <LogoutHandler />,
      },

      // Unauthorized page
      {
        path: 'unauthorized',
        element: <SuspenseWrapper component={UnauthorizedPage} />,
      },

      // Catch-all 404 under MainLayout
      {
        path: '*',
        element: <SuspenseWrapper component={NotFoundPage} />,
      },
    ],
  },

  // Test routes with TestLayout (only for taking tests) - require authentication
  {
    path: '/test',
    element: (
      <RequireAuth>
        <TestLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: 'screen',
        element: <SuspenseWrapper component={TestScreen} />,
      },
      {
        path: 'not-found',
        element: <SuspenseWrapper component={TestNotFoundPage} />,
      },
      {
        path: 'reference',
        element: <SuspenseWrapper component={TestReferencePage} />,
      },
    ],
  },

  // Auth routes with AuthLayout
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/auth/login" replace />,
      },
      {
        path: 'login',
        element: <SuspenseWrapper component={LoginPage} />,
      },
      {
        path: 'register',
        element: <SuspenseWrapper component={RegisterPage} />,
      },
      {
        path: 'forgot-password',
        element: <SuspenseWrapper component={ForgotPasswordPage} />,
      },
      {
        path: 'forgot-password/change',
        element: (
          <SuspenseWrapper component={ChangePasswordPage} />
        ),
      },
    ],
  },
];

export default AppRoutes;
