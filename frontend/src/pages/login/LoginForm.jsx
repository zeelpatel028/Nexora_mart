import React, { useState, useEffect } from 'react';
import { ArrowRightIcon } from '../../components/branding/Icons';
import { LoginInput } from '../../components/auth/LoginInput';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { RememberMe } from '../../components/auth/RememberMe';
import { SocialAuthButton } from '../../components/auth/SocialAuthButton';
import { validateLoginForm } from './LoginValidation';
import { useAuth } from '../../hooks/useAuth';

const REMEMBER_EMAIL_KEY = 'nexora_remember_email';

export const LoginForm = ({ 
  subtitle = 'Sign in to continue to Nmart',
  onLoginSuccess, 
  onForgotPassword, 
  onCreateAccount, 
  onSocialLogin 
}) => {
  const { login, socialLogin } = useAuth();
  
  // Initialize email from localStorage if available
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem(REMEMBER_EMAIL_KEY) || '';
    } catch {
      return '';
    }
  });

  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [retryCountdown, setRetryCountdown] = useState(0);

  // Active rate-limit countdown effect
  useEffect(() => {
    if (retryCountdown <= 0) return;
    const interval = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setErrorMsg('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [retryCountdown]);

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || retryCountdown > 0) return;

    setErrorMsg('');
    setFieldErrors({});

    const validation = validateLoginForm({ email, password });
    if (!validation.isValid) {
      if (validation.field) {
        setFieldErrors({ [validation.field]: validation.error });
      } else {
        setErrorMsg(validation.error);
      }
      return;
    }

    setIsLoading(true);
    try {
      const response = await login({ email, password });
      setIsLoading(false);

      // Persist email if remember me checked
      try {
        if (rememberMe) {
          localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
        } else {
          localStorage.removeItem(REMEMBER_EMAIL_KEY);
        }
      } catch {
        // Ignore storage error
      }

      if (onLoginSuccess) {
        onLoginSuccess(response?.user || { email });
      }
    } catch (err) {
      setIsLoading(false);
      if (err.status === 429) {
        const waitTime = err.retryAfter || err.data?.retryAfter || 300;
        setRetryCountdown(waitTime);
        setErrorMsg('Too many login attempts. Please try again in 5 minutes.');
      } else {
        setErrorMsg(err.message || 'Login failed. Please check your credentials.');
      }
    }
  };

  const handleGoogleClick = async (provider = 'Google') => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await socialLogin(provider);
      setIsLoading(false);
      if (onSocialLogin) {
        onSocialLogin(provider, res?.user);
      }
      if (onLoginSuccess && res?.user) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Google sign-in could not be completed.');
    }
  };

  return (
    <div className="nexora-login-form-container">
      {/* 1. Welcome Back Heading */}
      <div className="nexora-login-header">
        <h1 className="nexora-welcome-title">
          Welcome Back
        </h1>
        {subtitle && (
          <p className="nexora-welcome-subtitle">
            {subtitle}
          </p>
        )}
      </div>

      {/* Global Error Message Alert with Rate Limit Countdown */}
      {errorMsg && (
        <div className="nexora-form-error-banner" role="alert">
          <div>{errorMsg}</div>
          {retryCountdown > 0 && (
            <div style={{ marginTop: '8px', fontSize: '13px', color: '#FF843D', fontWeight: 'bold' }}>
              Remaining wait time: {formatCountdown(retryCountdown)}
            </div>
          )}
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} noValidate>
        {/* 2. Email Address Input */}
        <LoginInput
          id="login-email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errorMsg && retryCountdown === 0) setErrorMsg('');
            if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
          }}
          onClear={() => {
            setEmail('');
            document.getElementById('login-email')?.focus();
          }}
          placeholder="Email address"
          error={fieldErrors.email}
          disabled={isLoading || retryCountdown > 0}
        />

        {/* 3 & 4. Password Input with Show/Hide Toggle */}
        <PasswordInput
          id="login-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errorMsg && retryCountdown === 0) setErrorMsg('');
            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
          }}
          placeholder="Password"
          error={fieldErrors.password}
          disabled={isLoading || retryCountdown > 0}
        />

        {/* 5 & 6. Keep me signed in & Forgot Password? */}
        <div className="nexora-options-row">
          <RememberMe
            id="keep-signed-in"
            checked={rememberMe}
            onChange={setRememberMe}
            label="Keep me signed in"
          />

          <button
            type="button"
            id="forgot-password-link"
            className="nexora-forgot-link"
            onClick={onForgotPassword}
          >
            Forgot Password?
          </button>
        </div>

        {/* 7. Large Gradient Login Button with Arrow */}
        <button
          id="btn-sign-in"
          type="submit"
          disabled={isLoading || retryCountdown > 0}
          className="nexora-btn-login"
        >
          {isLoading ? (
            <div className="spinner-border spinner-border-sm text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : retryCountdown > 0 ? (
            <span>Retry in {formatCountdown(retryCountdown)}</span>
          ) : (
            <>
              <span>Log In</span>
              <ArrowRightIcon size={22} color="#FFFFFF" />
            </>
          )}
        </button>
      </form>

      {/* 8. Divider: Or continue with */}
      <div className="nexora-divider-row">
        <div className="nexora-divider-line" />
        <span className="nexora-divider-text">
          Or continue with
        </span>
        <div className="nexora-divider-line" />
      </div>

      {/* 9. Continue with Google Button */}
      <div className="nexora-social-row">
        <SocialAuthButton
          id="social-google"
          provider="Google"
          onClick={() => handleGoogleClick('Google')}
          disabled={isLoading}
        />
      </div>

      {/* 10. Don't have an account? Sign Up Link */}
      <div className="nexora-signup-footer">
        <span className="nexora-signup-label">Don't have an account? </span>
        <button
          type="button"
          id="create-account-link"
          className="nexora-signup-action"
          onClick={onCreateAccount}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
