import React, { useEffect, lazy, Suspense } from 'react';
import { useRouter } from './useRouter';
import { useAuth } from '../hooks/useAuth';
import { Login } from '../pages/login';
import { SplashScreen } from '../pages/splash/SplashScreen';
import { Loader } from '../components/common/Loader';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

const ForgotPasswordPage = lazy(() =>
  import('../pages/login/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
);
const Dashboard = lazy(() =>
  import('../pages/dashboard/Dashboard').then((m) => ({ default: m.Dashboard }))
);
const ErrorPage = lazy(() =>
  import('../pages/error/ErrorPage').then((m) => ({ default: m.ErrorPage }))
);

const RouteFallback = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Loader size={32} text="Loading..." />
  </div>
);

export const AppRoutes = ({ brandName = 'TULSI MART' }) => {
  const { currentPath, navigate } = useRouter();
  const { user, logout, isInitializing } = useAuth();

  const normalizedPath = (currentPath.toLowerCase().split('?')[0].replace(/\/+$/, '') || '/');

  // List of public auth paths
  const authPaths = ['/', '/splash', '/login', '/register', '/forgot-password'];
  const isAuthPath = authPaths.includes(normalizedPath);

  useEffect(() => {
    // Route guards: redirect authenticated users away from login/splash, unauthenticated to login
    if (user && (normalizedPath === '/' || normalizedPath === '/login' || normalizedPath === '/register' || normalizedPath === '/splash')) {
      navigate('/dashboard', { replace: true });
    } else if (!user && !isAuthPath) {
      navigate('/login', { replace: true });
    }
  }, [user, normalizedPath, isAuthPath, navigate]);

  // Preview / Error Routes for testing & status redirection
  if (normalizedPath === '/401' || normalizedPath === '/unauthorized') {
    return <Suspense fallback={<RouteFallback />}><ErrorPage code={401} onLogin={() => navigate('/login')} onGoHome={() => navigate('/login')} /></Suspense>;
  }
  if (normalizedPath === '/403' || normalizedPath === '/forbidden') {
    return <Suspense fallback={<RouteFallback />}><ErrorPage code={403} onGoHome={() => navigate(user ? '/dashboard' : '/login')} /></Suspense>;
  }
  if (normalizedPath === '/404' || normalizedPath === '/not-found') {
    return <Suspense fallback={<RouteFallback />}><ErrorPage code={404} onGoHome={() => navigate(user ? '/dashboard' : '/login')} onGoBack={() => window.history.back()} /></Suspense>;
  }
  if (normalizedPath === '/429' || normalizedPath === '/rate-limit') {
    return <Suspense fallback={<RouteFallback />}><ErrorPage code={429} onRetry={() => navigate(user ? '/dashboard' : '/login')} onGoHome={() => navigate(user ? '/dashboard' : '/login')} /></Suspense>;
  }
  if (normalizedPath === '/500' || normalizedPath === '/server-error') {
    return <Suspense fallback={<RouteFallback />}><ErrorPage code={500} onRetry={() => window.location.reload()} onGoHome={() => navigate(user ? '/dashboard' : '/login')} /></Suspense>;
  }
  if (normalizedPath === '/502' || normalizedPath === '/bad-gateway') {
    return <Suspense fallback={<RouteFallback />}><ErrorPage code={502} onRetry={() => window.location.reload()} onGoHome={() => navigate(user ? '/dashboard' : '/login')} /></Suspense>;
  }
  if (normalizedPath === '/503' || normalizedPath === '/maintenance') {
    return <Suspense fallback={<RouteFallback />}><ErrorPage code={503} onRetry={() => window.location.reload()} onGoHome={() => navigate(user ? '/dashboard' : '/login')} /></Suspense>;
  }
  if (normalizedPath === '/504' || normalizedPath === '/timeout') {
    return <Suspense fallback={<RouteFallback />}><ErrorPage code={504} onRetry={() => window.location.reload()} onGoHome={() => navigate(user ? '/dashboard' : '/login')} /></Suspense>;
  }

  if (isInitializing) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF9F3' }}>
        <Loader size={36} text="Connecting to Tulsi Mart..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteFallback />}>
        {/* 1. Splash Screen */}
      {(normalizedPath === '/' || normalizedPath === '/splash') && (
        <SplashScreen
          brandName={brandName}
          onComplete={() => navigate(user ? '/dashboard' : '/login')}
          autoNavigateDelay={3200}
        />
      )}

      {/* 2. Login Screen */}
      {normalizedPath === '/login' && (
        <Login
          brandName={brandName}
          authMode="login"
          onLoginSuccess={() => navigate('/dashboard')}
          onNavigateToDashboard={() => navigate('/dashboard')}
          onNavigateToRegister={() => navigate('/register')}
        />
      )}

      {/* 3. Register / Create Account Screen */}
      {normalizedPath === '/register' && (
        <Login
          brandName={brandName}
          authMode="register"
          onLoginSuccess={() => navigate('/dashboard')}
          onNavigateToDashboard={() => navigate('/dashboard')}
          onNavigateToLogin={() => navigate('/login')}
        />
      )}

      {/* 4. Forgot Password & OTP & Reset Screen */}
      {normalizedPath === '/forgot-password' && (
        <ForgotPasswordPage brandName={brandName} />
      )}

      {/* 5. Protected App Dashboard */}
      {user && !isAuthPath && (
        (() => {
          let tab = 'overview';
          if (normalizedPath === '/pos' || normalizedPath === '/billing' || normalizedPath === '/make-bill') {
            tab = 'pos';
          } else if (normalizedPath === '/sales' || normalizedPath === '/invoices' || normalizedPath === '/view-bill') {
            tab = 'sales';
          } else if (normalizedPath === '/products') {
            tab = 'products';
          } else if (normalizedPath === '/products/add' || normalizedPath === '/add-product') {
            tab = 'add-product';
          } else if (normalizedPath === '/debit-customers' || normalizedPath === '/customers/debit') {
            tab = 'debit-customers';
          } else if (normalizedPath === '/customers') {
            tab = 'customers';
          } else if (normalizedPath === '/suppliers') {
            tab = 'suppliers';
          } else if (normalizedPath === '/orders' || normalizedPath === '/purchases') {
            tab = 'purchases';
          } else if (normalizedPath === '/expenses' || normalizedPath === '/finance') {
            tab = 'expenses';
          } else if (normalizedPath === '/employees') {
            tab = 'employees';
          } else if (normalizedPath === '/reports' || normalizedPath === '/analytics') {
            tab = 'reports';
          } else if (normalizedPath === '/profile') {
            tab = 'profile';
          } else if (normalizedPath === '/stores') {
            tab = 'stores';
          } else if (normalizedPath === '/settings') {
            tab = 'settings';
          } else if (normalizedPath === '/inventory' || normalizedPath === '/stock') {
            tab = 'inventory';
          } else if (normalizedPath === '/more' || normalizedPath === '/menu') {
            tab = 'more';
          } else if (normalizedPath !== '/dashboard') {
            return (
              <ErrorPage
                code={404}
                onGoHome={() => navigate('/dashboard')}
                onGoBack={() => window.history.back()}
              />
            );
          }

          return (
            <Dashboard
              user={user}
              initialTab={tab}
              onLogout={async () => {
                await logout();
                navigate('/login');
              }}
            />
          );
        })()
      )}

      {/* Fallback for unauthenticated deep paths */}
      {!user && !isAuthPath && (
        <Login
          brandName={brandName}
          authMode="login"
          onLoginSuccess={() => navigate('/dashboard')}
          onNavigateToDashboard={() => navigate('/dashboard')}
          onNavigateToRegister={() => navigate('/register')}
        />
      )}
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRoutes;
