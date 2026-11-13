import React from 'react';
import { Login } from '../login/Login';

/**
 * Register Page
 * Re-uses the Login layout with authMode="register" to guarantee 100% identical styling:
 * - Fixed soft multi-layered wave background
 * - Desktop: Split layout (3D M logo on left, floating frosted card on right)
 * - Mobile: Top branding + bottom sheet frosted card
 */
export const Register = ({
  brandName = 'TULSI MART',
  onRegisterSuccess,
  onNavigateToLogin,
  onNavigateToDashboard
}) => {
  return (
    <Login
      brandName={brandName}
      authMode="register"
      onLoginSuccess={onRegisterSuccess}
      onNavigateToLogin={onNavigateToLogin}
      onNavigateToDashboard={onNavigateToDashboard}
    />
  );
};

export default Register;
