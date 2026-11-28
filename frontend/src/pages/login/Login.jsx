import React, { useState } from 'react';
import { useResponsive } from '../../responsive';
import { WebsiteView, MobileView } from './views';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { WaveBackground } from './WaveBackground';
import { Toast } from '../../components/common/Toast';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import './Login.css';

/**
 * Login Component - Main entry page for User Authentication
 * Seamlessly adapts layout:
 * - Fixed soft orange wave background behind everything
 * - Desktop (>= 768px): 2-column split layout with semi-transparent blurred card
 * - Mobile (< 768px): Top logo branding + bottom sheet semi-transparent blurred card
 */
export const Login = ({ 
  brandName = 'TULSI MART',
  authMode: propAuthMode,
  onLoginSuccess: propOnLoginSuccess,
  onNavigateToDashboard,
  onNavigateToRegister,
  onNavigateToLogin
}) => {
  const { isDesktop, isMobile } = useResponsive();
  const [toast, setToast] = useState(null);
  const [internalAuthMode, setInternalAuthMode] = useState('login'); // 'login' | 'register'
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const authMode = propAuthMode || internalAuthMode;

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleLoginSuccess = (userData) => {
    const userIdentifier = userData?.email ? userData.email.split('@')[0] : 'User';
    showToast(`Welcome back, ${userIdentifier}!`, 'success');
    if (propOnLoginSuccess) {
      propOnLoginSuccess(userData);
    }
    if (onNavigateToDashboard) {
      setTimeout(onNavigateToDashboard, 600);
    }
  };

  const handleRegisterSuccess = ({ firstName, storeType }) => {
    showToast(`Store account created for ${firstName}! (${storeType || 'Store'})`, 'success');
    if (onNavigateToLogin) {
      onNavigateToLogin();
    } else {
      setInternalAuthMode('login');
    }
  };

  const handleSocialLogin = (provider) => {
    showToast(`Connecting with ${provider}...`, 'success');
  };

  const commonProps = {
    brandName,
    authMode,
    onLoginSuccess: handleLoginSuccess,
    onRegisterSuccess: handleRegisterSuccess,
    onForgotPassword: () => setIsForgotOpen(true),
    onCreateAccount: onNavigateToRegister || (() => setInternalAuthMode('register')),
    onNavigateToLogin: onNavigateToLogin || (() => setInternalAuthMode('login')),
    onSocialLogin: handleSocialLogin
  };

  return (
    <div className="login-page-root">
      {/* Floating Theme Switcher (System / Light / Dark) */}
      <ThemeToggle />

      {/* Soft Multi-Layer Organic Wave Background (Fixed Behind Everything) */}
      <WaveBackground />

      {/* 1. Desktop Website Layout (>= 768px) */}
      {isDesktop && <WebsiteView {...commonProps} />}

      {/* 2. Mobile Layout (< 768px) */}
      {isMobile && <MobileView {...commonProps} />}

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        onResetSent={(email) =>
          showToast(`Reset instructions sent to ${email}`, 'success')
        }
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export const LoginPage = Login;
export default Login;
