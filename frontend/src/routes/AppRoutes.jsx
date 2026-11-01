import React, { useEffect } from 'react';
import { useRouter } from './useRouter';
import { useAuth } from '../hooks/useAuth';
import { Login } from '../pages/login';
import { Dashboard } from '../pages/dashboard';
import { NotFound } from '../pages/not-found';
import { SplashScreen } from '../pages/splash/SplashScreen';
import { Loader } from '../components/common/Loader';

export const AppRoutes = ({ brandName = 'NEXORA MART' }) => {
  const { currentPath, navigate } = useRouter();
  const { user, logout, isInitializing } = useAuth();

  const normalizedPath = (currentPath.toLowerCase().split('?')[0].replace(/\/+$/, '') || '/');

  useEffect(() => {
    // Route guards: redirect authenticated users to dashboard, unauthenticated to login
    if (user && (normalizedPath === '/' || normalizedPath === '/login' || normalizedPath === '/register' || normalizedPath === '/splash')) {
      navigate('/dashboard', { replace: true });
    } else if (!user && normalizedPath === '/dashboard') {
      navigate('/login', { replace: true });
    }
  }, [user, normalizedPath, navigate]);

  if (isInitializing) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF9F3' }}>
        <Loader size={36} text="Connecting to Nexora Mart..." />
      </div>
    );
  }

  let content;

  if (normalizedPath === '/' || normalizedPath === '/splash') {
    content = (
      <SplashScreen
        brandName={brandName}
        onComplete={() => navigate('/login')}
        autoNavigateDelay={3200}
      />
    );
  } else if (normalizedPath === '/login') {
    content = (
      <Login
        brandName={brandName}
        authMode="login"
        onLoginSuccess={() => navigate('/dashboard')}
        onNavigateToDashboard={() => navigate('/dashboard')}
        onNavigateToRegister={() => navigate('/register')}
      />
    );
  } else if (normalizedPath === '/register') {
    content = (
      <Login
        brandName={brandName}
        authMode="register"
        onLoginSuccess={() => navigate('/dashboard')}
        onNavigateToDashboard={() => navigate('/dashboard')}
        onNavigateToLogin={() => navigate('/login')}
      />
    );
  } else if (normalizedPath === '/dashboard') {
    content = user ? (
      <Dashboard
        user={user}
        onLogout={async () => {
          await logout();
          navigate('/login');
        }}
      />
    ) : (
      <Login
        brandName={brandName}
        authMode="login"
        onLoginSuccess={() => navigate('/dashboard')}
        onNavigateToDashboard={() => navigate('/dashboard')}
        onNavigateToRegister={() => navigate('/register')}
      />
    );
  } else {
    content = (
      <NotFound
        onGoHome={() => navigate(user ? '/dashboard' : '/login')}
      />
    );
  }

  return content;
};

export default AppRoutes;
