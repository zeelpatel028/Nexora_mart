import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { LoginInput } from '../../components/auth/LoginInput';
import { isValidEmail } from '../../utils';
import { authService } from '../../services';

export const ForgotPasswordModal = ({ isOpen, onClose, onResetSent }) => {
  const [step, setStep] = useState('request'); // 'request' | 'verify' | 'success'
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [otpInfo, setOtpInfo] = useState('');

  if (!isOpen) return null;

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!resetEmail || !isValidEmail(resetEmail)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(resetEmail);
      setIsLoading(false);
      if (res?.otp) {
        setOtpInfo(`Your 6-digit verification code is: ${res.otp}`);
      }
      setStep('verify');
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Failed to dispatch verification code');
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

    setIsLoading(true);
    try {
      await authService.resetPassword(resetEmail, otp.trim(), newPassword);
      setIsLoading(false);
      setStep('success');
      if (onResetSent) onResetSent(resetEmail);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Failed to verify OTP and reset password');
    }
  };

  const handleClose = () => {
    setStep('request');
    setResetEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    setOtpInfo('');
    onClose();
  };

  return (
    <Modal
      id="forgot-password-modal"
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'verify' ? 'Verify OTP & Reset Password' : step === 'success' ? 'Password Reset Successful' : 'Reset Password'}
      subtitle={
        step === 'verify'
          ? `Enter the 6-digit OTP sent to ${resetEmail} and your new password.`
          : step === 'success'
          ? 'Your password has been changed securely. You can now log in.'
          : 'Enter your registered email address to receive a 6-digit verification OTP.'
      }
      maxWidth="420px"
    >
      {errorMsg && (
        <div className="alert alert-danger py-2 small mb-3" role="alert">
          ⚠️ {errorMsg}
        </div>
      )}

      {otpInfo && step === 'verify' && (
        <div className="alert alert-info py-2 small mb-3">
          ℹ️ {otpInfo}
        </div>
      )}

      {step === 'request' && (
        <form onSubmit={handleRequestOtp} noValidate>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Registered Email</label>
            <LoginInput
              id="reset-password-email"
              value={resetEmail}
              onChange={(e) => {
                setResetEmail(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              onClear={() => setResetEmail('')}
              placeholder="e.g. merchant@nmart.com"
              required
            />
          </div>

          <div className="mt-3">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              {isLoading ? 'Sending Code...' : 'Send Verification OTP'}
            </Button>
          </div>
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={handleResetPassword} noValidate>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">6-Digit OTP Code</label>
            <input
              type="text"
              className="form-control"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="123456"
              maxLength={6}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">New Password</label>
            <input
              type="password"
              className="form-control"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Minimum 6 characters"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Confirm New Password</label>
            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Re-enter password"
              required
            />
          </div>

          <div className="mt-3">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP & Reset Password'}
            </Button>
          </div>

          <div className="text-center mt-2">
            <button
              type="button"
              className="btn btn-sm btn-link text-decoration-none text-secondary"
              onClick={() => setStep('request')}
            >
              ← Change email / Resend code
            </button>
          </div>
        </form>
      )}

      {step === 'success' && (
        <div className="text-center py-3">
          <div className="fs-1 mb-2">🎉</div>
          <p className="fw-semibold text-success mb-3">Your password has been reset successfully!</p>
          <Button
            type="button"
            variant="primary"
            fullWidth
            onClick={handleClose}
          >
            Return to Sign In
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default ForgotPasswordModal;
