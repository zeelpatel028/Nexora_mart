import React from 'react';
import { BrandLogo } from '../../../components/branding/BrandLogo';
import { LoginForm } from '../LoginForm';
import { RegisterForm } from '../RegisterForm';

/**
 * MobileView - Dedicated Mobile Smartphone Layout (< 768px)
 * Two-Half Structure:
 * - Part 1 (Top Half, ~38% height): Vertically & horizontally centered 3D M Logo + NEXORA MART wordmark
 * - Part 2 (Second Half, ~62% height): Docked Frosted Glass Card sized so no vertical scrolling occurs
 */
export const MobileView = ({
  brandName = 'TULSI MART',
  authMode = 'login',
  onLoginSuccess,
  onRegisterSuccess,
  onForgotPassword,
  onCreateAccount,
  onNavigateToLogin,
  onSocialLogin
}) => {
  return (
    <div className="nexora-mobile-layout">
      {/* ==========================================
          TOP HALF PART: Centered Logo + Wordmark
         ========================================== */}
      <div className="nexora-mobile-top-half">
        <div className="nexora-brand-centered-wrapper">
          <div className="nexora-ambient-glow" />
          <BrandLogo
            brandName={brandName}
            size={92}
            textSize={26}
            showTitle={true}
            showTagline={true}
            tagline="Smart Shopping, Delivered Fresh"
          />
        </div>
      </div>

      {/* ==========================================
          SECOND HALF PART: Bottom Frosted Card (No scrollbar)
         ========================================== */}
      <div className="nexora-mobile-bottom-half">
        <div className="nexora-mobile-card">
          <div key={authMode} className="auth-form-animated-box">
            {authMode === 'register' ? (
              <RegisterForm
                brandName={brandName}
                onRegisterSuccess={onRegisterSuccess}
                onNavigateToLogin={onNavigateToLogin}
              />
            ) : (
              <LoginForm
                subtitle="Sign in to continue to Nmart"
                onLoginSuccess={onLoginSuccess}
                onForgotPassword={onForgotPassword}
                onCreateAccount={onCreateAccount}
                onSocialLogin={onSocialLogin}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileView;
