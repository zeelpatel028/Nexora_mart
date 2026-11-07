import React, { useEffect } from 'react';
import { useRouter } from './useRouter';
import { useAuth } from '../hooks/useAuth';
import { Login } from '../pages/login';
import { ForgotPasswordPage } from '../pages/login/ForgotPasswordPage';
import { Dashboard } from '../pages/dashboard';
import { NotFound } from '../pages/not-found';
import { SplashScreen } from '../pages/splash/SplashScreen';
import { Loader } from '../components/common/Loader';

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

  if (isInitializing) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF9F3' }}>
        <Loader size={36} text="Connecting to Nexora Mart..." />
      </div>
    );
  }

  // 1. Splash Screen
  if (normalizedPath === '/' || normalizedPath === '/splash') {
    return (
      <SplashScreen
        brandName={brandName}
        onComplete={() => navigate(user ? '/dashboard' : '/login')}
        autoNavigateDelay={3200}
      />
    );
  }

  // 2. Login Screen
  if (normalizedPath === '/login') {
    return (
      <Login
        brandName={brandName}
        authMode="login"
        onLoginSuccess={() => navigate('/dashboard')}
        onNavigateToDashboard={() => navigate('/dashboard')}
        onNavigateToRegister={() => navigate('/register')}
      />
    );
  }

  // 3. Register / Create Account Screen
  if (normalizedPath === '/register') {
    return (
      <Login
        brandName={brandName}
        authMode="register"
        onLoginSuccess={() => navigate('/dashboard')}
        onNavigateToDashboard={() => navigate('/dashboard')}
        onNavigateToLogin={() => navigate('/login')}
      />
    );
  }

  // 4. Forgot Password & OTP & Reset Screen
  if (normalizedPath === '/forgot-password') {
    return <ForgotPasswordPage brandName={brandName} />;
  }

  // Protected App Screens (Map URL paths to Dashboard tabs)
  if (user) {
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
    } else if (normalizedPath === '/inventory') {
      tab = 'inventory';
    } else if (normalizedPath === '/categories') {
      tab = 'categories';
    } else if (normalizedPath !== '/dashboard') {
      return <NotFound onGoHome={() => navigate('/dashboard')} />;
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
  }

  return (
    <Login
      brandName={brandName}
      authMode="login"
      onLoginSuccess={() => navigate('/dashboard')}
      onNavigateToDashboard={() => navigate('/dashboard')}
      onNavigateToRegister={() => navigate('/register')}
    />
  );
};

export default AppRoutes;
