import React from 'react';
import { GoogleIcon } from '../branding/Icons';

/**
 * Social Authentication Button (Continue with Google)
 * - Matched 1:1 to Reference Screenshot (media_1793531577699_4418a210.jpg)
 * - Height: 46px
 * - Radius: 14px
 * - Dark mode: #1B2232 background, #283348 subtle border, #FFFFFF crisp text
 */
export const SocialAuthButton = ({
  provider = 'Google',
  onClick,
  id = 'social-google',
  disabled = false
}) => {
  return (
    <button
      type="button"
      id={id}
      disabled={disabled}
      onClick={() => onClick && onClick(provider)}
      style={{
        width: '100%',
        height: '44px',
        borderRadius: '12px',
        border: '1px solid var(--border-social, #283348)',
        backgroundColor: 'var(--bg-social, #1B2232)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        fontSize: '14px',
        fontWeight: 600,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: 'var(--text-social, #FFFFFF)',
        boxShadow: 'var(--shadow-social, none)',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: '0 20px',
        userSelect: 'none',
        boxSizing: 'border-box'
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.filter = 'brightness(1.08)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.filter = 'none';
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(0.99)';
        }
      }}
    >
      <GoogleIcon size={22} />
      <span>Continue with {provider}</span>
    </button>
  );
};

export default SocialAuthButton;
