import React from 'react';
import { BrandLogo } from '../../../components/branding/BrandLogo';
import { NexoraBackgroundWaves } from '../../../components/artwork/NexoraBackgroundWaves';
import { LoginForm } from '../LoginForm';
import { RegisterForm } from '../RegisterForm';

/**
 * TabletView - Dedicated Tablet Device Layout (600px - 1023px)
 * Responsive layout with adjusted spacing, brand header, and rounded login card
 */
export const TabletView = ({
  brandName = 'NEXORA MART',
  authMode = 'login',
  onLoginSuccess,
  onRegisterSuccess,
  onForgotPassword,
  onCreateAccount,
  onNavigateToLogin,
  onSocialLogin
}) => {
  return (
    <div className="nexora-tablet-layout">
      {/* Background Waves */}
      <NexoraBackgroundWaves />

      {/* Top Branding Section */}
      <div className="nexora-tablet-branding">
        <BrandLogo
          brandName={brandName}
          size={180}
          textSize={30}
          showTitle={true}
        />
      </div>

      {/* Centered Login Card */}
      <div className="nexora-tablet-card-container">
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

export default TabletView;
