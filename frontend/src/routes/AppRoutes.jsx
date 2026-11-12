import React, { useEffect } from 'react';
import { useRouter } from './useRouter';
import { useAuth } from '../hooks/useAuth';
import { Login } from '../pages/login';
import { ForgotPasswordPage } from '../pages/login/ForgotPasswordPage';
import { Dashboard } from '../pages/dashboard';
import { ErrorPage } from '../pages/error/ErrorPage';
import { SplashScreen } from '../pages/splash/SplashScreen';
import { Loader } from '../components/common/Loader';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

export const AppRoutes = ({ brandName = 'NEXORA MART' }) => {
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
    return <ErrorPage code={401} onLogin={() => navigate('/login')} onGoHome={() => navigate('/login')} />;
  }
  if (normalizedPath === '/403' || normalizedPath === '/forbidden') {
    return <ErrorPage code={403} onGoHome={() => navigate(user ? '/dashboard' : '/login')} />;
  }
  if (normalizedPath === '/404' || normalizedPath === '/not-found') {
    return <ErrorPage code={404} onGoHome={() => navigate(user ? '/dashboard' : '/login')} onGoBack={() => window.history.back()} />;
  }
  if (normalizedPath === '/429' || normalizedPath === '/rate-limit') {
    return <ErrorPage code={429} onRetry={() => navigate(user ? '/dashboard' : '/login')} onGoHome={() => navigate(user ? '/dashboard' : '/login')} />;
  }
  if (normalizedPath === '/500' || normalizedPath === '/server-error') {
    return <ErrorPage code={500} onRetry={() => window.location.reload()} onGoHome={() => navigate(user ? '/dashboard' : '/login')} />;
  }
  if (normalizedPath === '/502' || normalizedPath === '/bad-gateway') {
    return <ErrorPage code={502} onRetry={() => window.location.reload()} onGoHome={() => navigate(user ? '/dashboard' : '/login')} />;
  }
  if (normalizedPath === '/503' || normalizedPath === '/maintenance') {
    return <ErrorPage code={503} onRetry={() => window.location.reload()} onGoHome={() => navigate(user ? '/dashboard' : '/login')} />;
  }
  if (normalizedPath === '/504' || normalizedPath === '/timeout') {
    return <ErrorPage code={504} onRetry={() => window.location.reload()} onGoHome={() => navigate(user ? '/dashboard' : '/login')} />;
  }

  if (isInitializing) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF9F3' }}>
        <Loader size={36} text="Connecting to Nexora Mart..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
};

export default AppRoutes;
