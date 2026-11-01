import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { LoginInput } from '../../components/auth/LoginInput';
import { isValidEmail } from '../../utils';
import { authService } from '../../services';

export const ForgotPasswordModal = ({ isOpen, onClose, onResetSent }) => {
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!resetEmail || !isValidEmail(resetEmail)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(resetEmail);
      setIsLoading(false);
      onResetSent(resetEmail);
      setResetEmail('');
      onClose();
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Failed to send reset link');
    }
  };

  return (
    <Modal
      id="forgot-password-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Reset Password"
      subtitle="Enter your registered email address and we'll send you instructions to reset your password."
      maxWidth="400px"
    >
      {errorMsg && (
        <div className="form-error-banner" role="alert">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSend} noValidate>
        <LoginInput
          id="reset-password-email"
          value={resetEmail}
          onChange={(e) => {
            setResetEmail(e.target.value);
            if (errorMsg) setErrorMsg('');
          }}
          onClear={() => setResetEmail('')}
          placeholder="Enter your email"
          required
        />

        <div style={{ marginTop: '16px' }}>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
          >
            {isLoading ? 'Sending Link...' : 'Send Reset Link'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ForgotPasswordModal;
