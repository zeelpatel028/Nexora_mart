import React from 'react';
import { BrandLogo } from '../../../components/branding/BrandLogo';
import { LoginForm } from '../LoginForm';
import { RegisterForm } from '../RegisterForm';

/**
 * WebsiteView - Dedicated Desktop Split-Screen Layout (>= 768px)
 * Matches reference image:
 * - Left: Clean 3D M Logo + NEXORA MART typography centered with ambient glow
 * - Right: Floating rounded semi-transparent frosted card
 */
export const WebsiteView = ({
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
    <div className="nexora-desktop-layout">
      {/* Left Section: Clean & Minimal Branding */}
      <div className="nexora-desktop-branding">
        <div className="nexora-brand-centered-wrapper">
          <div className="nexora-ambient-glow desktop" />
          <BrandLogo
            brandName={brandName}
            size={220}
            textSize={36}
            showTitle={true}
          />
        </div>
      </div>

      {/* Right Section: Large Rounded Semi-Transparent Card */}
      <div className="nexora-desktop-card-col">
        <div className="nexora-login-card">
          <div key={authMode} className="auth-form-animated-box">
            {authMode === 'register' ? (
              <RegisterForm
                brandName={brandName}
                onRegisterSuccess={onRegisterSuccess}
                onNavigateToLogin={onNavigateToLogin}
              />
            ) : (
              <LoginForm
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

export default WebsiteView;
