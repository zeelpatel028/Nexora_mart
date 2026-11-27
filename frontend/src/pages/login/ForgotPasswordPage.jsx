import React, { useState } from 'react';
import { BrandLogo } from '../../components/branding/BrandLogo';
import { WaveBackground } from './WaveBackground';
import { authService } from '../../services';
import { isValidEmail } from '../../utils';
import { useRouter } from '../../routes/useRouter';
import './LoginPage.css';

export const ForgotPasswordPage = ({ brandName = 'NEXORA MART' }) => {
  const { navigate } = useRouter();
  const [step, setStep] = useState('request'); // 'request' | 'verify' | 'success'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [serverOtpInfo, setServerOtpInfo] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim()) {
      setErrorMsg('Email is required');
      return;
    }
    if (!isValidEmail(email)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim());
      if (res && res.otp) {
        setServerOtpInfo(`Verification code: ${res.otp}`);
      }
      setStep('verify');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to dispatch verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!otp.trim()) {
      setErrorMsg('Please enter the 6-digit OTP code');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(email.trim(), otp.trim(), newPassword);
      setStep('success');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to verify OTP and reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nexora-login-page">
      <WaveBackground />

      <div className="nexora-desktop-layout">
        {/* Left: Branding */}
        <div className="nexora-desktop-branding">
          <div className="nexora-brand-centered-wrapper">
            <div className="nexora-ambient-glow desktop" />
            <BrandLogo
              brandName={brandName}
              size={200}
              textSize={34}
              showTitle={true}
            />
          </div>
        </div>

        {/* Right: Card */}
        <div className="nexora-desktop-card-col">
          <div className="nexora-login-card" style={{ maxWidth: '440px' }}>
            {step === 'request' && (
              <form onSubmit={handleRequestOtp}>
                <div className="mb-4 text-center">
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: 'rgba(255, 106, 26, 0.12)',
                      color: '#FF6A1A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      fontSize: '24px'
                    }}
                  >
                    🔑
                  </div>
                  <h2 className="auth-form-title">Forgot Password?</h2>
                  <p className="auth-form-subtitle">
                    Enter your registered email address to receive a 6-digit OTP verification code.
                  </p>
                </div>

                {errorMsg && (
                  <div className="alert alert-danger py-2 px-3 small mb-3">
                    ⚠️ {errorMsg}
                  </div>
                )}

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-secondary">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="merchant@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ height: '48px', borderRadius: '12px' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-bold"
                  disabled={loading}
                  style={{
                    backgroundColor: '#FF6A1A',
                    borderColor: '#FF6A1A',
                    borderRadius: '9999px',
                    height: '48px',
                    boxShadow: '0 8px 24px rgba(255, 106, 26, 0.35)'
                  }}
                >
                  {loading ? 'Sending Code...' : 'Send Verification OTP →'}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    className="btn btn-link text-decoration-none small text-secondary"
                    onClick={() => navigate('/login')}
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {step === 'verify' && (
              <form onSubmit={handleResetPassword}>
                <div className="mb-4 text-center">
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: 'rgba(255, 106, 26, 0.12)',
                      color: '#FF6A1A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      fontSize: '24px'
                    }}
                  >
                    ✉️
                  </div>
                  <h2 className="auth-form-title">Enter Verification Code</h2>
                  <p className="auth-form-subtitle">
                    We sent a 6-digit OTP to <strong>{email}</strong>. Enter it below with your new password.
                  </p>
                </div>

                {serverOtpInfo && (
                  <div className="alert alert-info py-2 px-3 small mb-3">
                    ℹ️ {serverOtpInfo}
                  </div>
                )}

                {errorMsg && (
                  <div className="alert alert-danger py-2 px-3 small mb-3">
                    ⚠️ {errorMsg}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    className="form-control text-center font-monospace"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    style={{ height: '48px', borderRadius: '12px', letterSpacing: '4px', fontSize: '18px', fontWeight: 'bold' }}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{ height: '48px', borderRadius: '12px' }}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-secondary">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ height: '48px', borderRadius: '12px' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-bold"
                  disabled={loading}
                  style={{
                    backgroundColor: '#FF6A1A',
                    borderColor: '#FF6A1A',
                    borderRadius: '9999px',
                    height: '48px',
                    boxShadow: '0 8px 24px rgba(255, 106, 26, 0.35)'
                  }}
                >
                  {loading ? 'Updating Password...' : 'Verify & Reset Password'}
                </button>

                <div className="text-center mt-3">
                  <button
                    type="button"
                    className="btn btn-link text-decoration-none small text-secondary"
                    onClick={() => setStep('request')}
                  >
                    ← Re-enter Email
                  </button>
                </div>
              </form>
            )}

            {step === 'success' && (
              <div className="text-center py-3">
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#ECFDF5',
                    color: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '32px'
                  }}
                >
                  ✓
                </div>
                <h3 className="auth-form-title text-success mb-2">Password Reset Successful!</h3>
                <p className="auth-form-subtitle mb-4">
                  Your password has been changed securely. You can now sign in with your new password.
                </p>
                <button
                  type="button"
                  className="btn btn-primary w-100 py-2 fw-bold"
                  onClick={() => navigate('/login')}
                  style={{
                    backgroundColor: '#FF6A1A',
                    borderColor: '#FF6A1A',
                    borderRadius: '9999px',
                    height: '48px',
                    boxShadow: '0 8px 24px rgba(255, 106, 26, 0.35)'
                  }}
                >
                  Proceed to Sign In →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

