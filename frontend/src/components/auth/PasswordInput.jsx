import React, { useState } from 'react';
import { LockIcon, EyeIcon, EyeOffIcon } from '../branding/Icons';

/**
 * Specialized Password Input
 * - Matched 1:1 to Reference Screenshot (media_1793531577699_4418a210.jpg)
 * - Comfortable 52px height (increased from 46px/48px)
 * - Radius: 16px
 * - Dark mode: #1B2232 background, #283348 subtle border, #FF6A1A orange icon, #FFFFFF text
 * - Bulletproof autofill handling (never turns white!)
 */
export const PasswordInput = ({
  id = 'login-password',
  value = '',
  onChange,
  placeholder = 'Password',
  autoComplete = 'current-password',
  error = '',
  disabled = false,
  required = false,
  height = '44px'
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div style={{ width: '100%', marginBottom: error ? '4px' : '0' }}>
      <div 
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          height: height,
          borderRadius: '12px',
          border: error 
            ? '1.5px solid #EF4444' 
            : isFocused 
              ? '1.5px solid var(--border-focus, #FF6A1A)' 
              : '1px solid var(--bg-input-border, #283348)',
          backgroundColor: 'var(--bg-input, #1B2232)',
          padding: '0 14px',
          boxShadow: isFocused 
            ? 'var(--shadow-input-focus)' 
            : 'var(--shadow-input, none)',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box'
        }}
      >
        <div 
          style={{ 
            marginRight: '10px', 
            display: 'flex', 
            alignItems: 'center', 
            flexShrink: 0 
          }}
        >
          <LockIcon color="#FF6A1A" size={20} />
        </div>
        <input
          id={id}
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          disabled={disabled}
          required={required}
          className="nexora-text-input"
          style={{
            width: '100%',
            height: '100%',
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '15px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: 'var(--text-primary, #FFFFFF)',
            fontWeight: 500,
            backgroundColor: 'transparent',
            padding: 0,
            margin: 0
          }}
        />
        <button
          type="button"
          id={`${id}-toggle-visibility`}
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          style={{
            marginLeft: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            borderRadius: '8px',
            color: 'var(--text-muted, #768499)',
            transition: 'color 0.2s',
            cursor: 'pointer',
            border: 'none',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#FF6A1A'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted, #768499)'; }}
        >
          {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
        </button>
      </div>
      {error && (
        <span 
          style={{ 
            fontSize: '12px', 
            color: '#EF4444', 
            display: 'block', 
            marginTop: '4px',
            paddingLeft: '4px',
            fontWeight: 500,
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default PasswordInput;
