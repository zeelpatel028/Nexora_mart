import React, { useState } from 'react';
import { 
  UserIcon, 
  MailIcon, 
  PhoneIcon, 
  StoreIcon, 
  LockIcon, 
  EyeIcon, 
  EyeOffIcon, 
  ArrowRightIcon, 
  ChevronDownIcon
} from '../../components/branding/Icons';
import { STORE_TYPES } from '../../constants';
import { validateRegisterForm } from './RegisterValidation';
import { useAuth } from '../../hooks/useAuth';

/**
 * RegisterForm - Create Account Form
 * Visuals match Login card design system exactly (media_1793531577699_4418a210.jpg):
 * - Dark Slate Card (#181E2B)
 * - Deep Slate-Navy Inputs (#1B2232, border #283348, orange icons #FF6A1A)
 * - Comfortable 46px height with clean 14px font size
 * - Bulletproof autofill handling (never turns white!)
 */
export const RegisterForm = ({ 
  brandName: _brandName = 'NEXORA MART',
  onRegisterSuccess, 
  onNavigateToLogin
}) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    email: '',
    phone: '',
    storeType: STORE_TYPES[0] || 'Retail & Supermarket',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const validation = validateRegisterForm(formData);
    if (!validation.isValid) {
      setErrorMsg(validation.error);
      return;
    }

    setIsLoading(true);
    try {
      const response = await register(formData);
      setIsLoading(false);
      if (onRegisterSuccess) {
        onRegisterSuccess(response?.user || formData);
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    }
  };

  const getContainerStyle = (fieldName) => {
    const isFocused = focusedField === fieldName;
    return {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      height: '42px',
      borderRadius: '14px',
      border: isFocused ? '1.5px solid var(--border-focus, #FF6A1A)' : '1px solid var(--bg-input-border, #283348)',
      backgroundColor: 'var(--bg-input, #1B2232)',
      padding: '0 12px',
      boxShadow: isFocused 
        ? 'var(--shadow-input-focus)' 
        : 'var(--shadow-input, none)',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box'
    };
  };

  const inputStyle = {
    width: '100%',
    height: '100%',
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: 'var(--text-primary, #FFFFFF)',
    fontWeight: 500,
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0
  };

  const iconWrapperStyle = {
    marginRight: '8px',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0
  };

  return (
    <div className="nexora-login-form-container">
      {/* 1. Header: Heading + Subtitle */}
      <div className="nexora-login-header" style={{ marginBottom: '10px' }}>
        <h1 className="nexora-welcome-title" style={{ fontSize: '24px', marginBottom: '2px' }}>
          Create Account
        </h1>
        <p className="nexora-welcome-subtitle" style={{ fontSize: '13px' }}>
          Sign up to continue to Nmart
        </p>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="nexora-form-error-banner" role="alert" style={{ padding: '6px 12px', fontSize: '12px', marginBottom: '8px' }}>
          {errorMsg}
        </div>
      )}

      {/* Form Fields: Smart 4-Row Layout */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Row 1: Name Fields (First Name & Surname side-by-side) */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '8px', 
            marginBottom: '8px' 
          }}
        >
          <div style={getContainerStyle('firstName')}>
            <div style={iconWrapperStyle}>
              <UserIcon color="#FF6A1A" size={18} />
            </div>
            <input
              id="register-firstname"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              onFocus={() => setFocusedField('firstName')}
              onBlur={() => setFocusedField(null)}
              placeholder="First name"
              autoComplete="given-name"
              disabled={isLoading}
              className="nexora-text-input"
              style={inputStyle}
            />
          </div>

          <div style={getContainerStyle('surname')}>
            <div style={iconWrapperStyle}>
              <UserIcon color="#FF6A1A" size={18} />
            </div>
            <input
              id="register-surname"
              type="text"
              value={formData.surname}
              onChange={(e) => handleChange('surname', e.target.value)}
              onFocus={() => setFocusedField('surname')}
              onBlur={() => setFocusedField(null)}
              placeholder="Surname"
              autoComplete="family-name"
              disabled={isLoading}
              className="nexora-text-input"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Row 2: Email & Phone (Side-by-side) */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '8px', 
            marginBottom: '8px' 
          }}
        >
          <div style={getContainerStyle('email')}>
            <div style={iconWrapperStyle}>
              <MailIcon color="#FF6A1A" size={18} />
            </div>
            <input
              id="register-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              placeholder="Email address"
              autoComplete="email"
              disabled={isLoading}
              className="nexora-text-input"
              style={inputStyle}
            />
          </div>

          <div style={getContainerStyle('phone')}>
            <div style={iconWrapperStyle}>
              <PhoneIcon color="#FF6A1A" size={18} />
            </div>
            <input
              id="register-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
              placeholder="Phone number"
              autoComplete="tel"
              disabled={isLoading}
              className="nexora-text-input"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Row 3: Store / Grocery Type (Full Width Dropdown) */}
        <div style={{ ...getContainerStyle('storeType'), marginBottom: '8px' }}>
          <div style={iconWrapperStyle}>
            <StoreIcon color="#FF6A1A" size={18} />
          </div>
          <select
            id="register-storetype"
            value={formData.storeType}
            onChange={(e) => handleChange('storeType', e.target.value)}
            onFocus={() => setFocusedField('storeType')}
            onBlur={() => setFocusedField(null)}
            disabled={isLoading}
            className="nexora-text-input"
            style={{
              ...inputStyle,
              fontSize: '13px',
              cursor: 'pointer',
              appearance: 'none',
              WebkitAppearance: 'none'
            }}
          >
            {STORE_TYPES.map((type) => (
              <option key={type} value={type} style={{ background: 'var(--bg-card-solid, #181E2B)', color: 'var(--text-primary, #FFFFFF)' }}>
                {type}
              </option>
            ))}
          </select>
          <div style={{ pointerEvents: 'none', display: 'flex', alignItems: 'center', color: 'var(--text-muted, #768499)', marginLeft: '6px' }}>
            <ChevronDownIcon size={16} />
          </div>
        </div>

        {/* Row 4: Password & Confirm Password (Side-by-side with visibility toggles) */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '8px', 
            marginBottom: '10px' 
          }}
        >
          {/* Password */}
          <div style={getContainerStyle('password')}>
            <div style={iconWrapperStyle}>
              <LockIcon color="#FF6A1A" size={16} />
            </div>
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              placeholder="Password"
              autoComplete="new-password"
              disabled={isLoading}
              className="nexora-text-input"
              style={inputStyle}
            />
            <button
              type="button"
              id="toggle-register-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                marginLeft: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
                borderRadius: '6px',
                color: 'var(--text-muted, #768499)',
                cursor: 'pointer',
                border: 'none',
                backgroundColor: 'transparent'
              }}
            >
              {showPassword ? (
                <EyeOffIcon size={16} color="#FF6A1A" />
              ) : (
                <EyeIcon size={16} color="var(--text-muted, #768499)" />
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div style={getContainerStyle('confirmPassword')}>
            <div style={iconWrapperStyle}>
              <LockIcon color="#FF6A1A" size={16} />
            </div>
            <input
              id="register-confirmpassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onFocus={() => setFocusedField('confirmPassword')}
              onBlur={() => setFocusedField(null)}
              placeholder="Confirm"
              autoComplete="new-password"
              disabled={isLoading}
              className="nexora-text-input"
              style={inputStyle}
            />
            <button
              type="button"
              id="toggle-register-confirmpassword"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              style={{
                marginLeft: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
                borderRadius: '6px',
                color: 'var(--text-muted, #768499)',
                cursor: 'pointer',
                border: 'none',
                backgroundColor: 'transparent'
              }}
            >
              {showConfirmPassword ? (
                <EyeOffIcon size={16} color="#FF6A1A" />
              ) : (
                <EyeIcon size={16} color="var(--text-muted, #768499)" />
              )}
            </button>
          </div>
        </div>

        {/* Primary Gradient Submit Button */}
        <button
          id="btn-register-submit"
          type="submit"
          disabled={isLoading}
          className="nexora-btn-login"
          style={{ height: '46px', fontSize: '16px' }}
        >
          {isLoading ? (
            <div className="spinner-border spinner-border-sm text-light" role="status">
              <span className="visually-hidden">Creating account...</span>
            </div>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRightIcon size={20} color="#FFFFFF" />
            </>
          )}
        </button>
      </form>

      {/* Footer Navigation */}
      <div className="nexora-signup-footer" style={{ marginTop: '10px' }}>
        <span className="nexora-signup-label">Already have an account?</span>
        <button
          type="button"
          id="navigate-to-login-link"
          className="nexora-signup-action"
          onClick={onNavigateToLogin}
        >
          Log In
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;
