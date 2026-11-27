import React, { useState } from 'react';
import { MailIcon, CloseIcon } from '../branding/Icons';

/**
 * Specialized Login/Email Input
 * - Matched 1:1 to Reference Screenshot (media_1793531577699_4418a210.jpg)
 * - Comfortable 52px height (increased from 46px/48px)
 * - Radius: 16px
 * - Dark mode: #1B2232 background, #283348 subtle border, #FF6A1A orange icon, #FFFFFF text
 * - Bulletproof autofill handling (never turns white!)
 */
export const LoginInput = ({
  id = 'login-email',
  value = '',
  onChange,
  onClear,
  placeholder = 'Email address',
  autoComplete = 'email',
  error = '',
  disabled = false,
  required = false,
  height = '44px'
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div style={{ width: '100%', marginBottom: error ? '4px' : '8px' }}>
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
          <MailIcon color="#FF6A1A" size={20} />
        </div>
        <input
          id={id}
          name="email"
          type="email"
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoCapitalize="none"
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
        {value && value.length > 0 && onClear && (
          <button
            type="button"
            id="clear-email-btn"
            onClick={onClear}
            aria-label="Clear email"
            style={{
              marginLeft: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              backgroundColor: 'rgba(120, 130, 150, 0.25)',
              color: 'var(--text-muted, #768499)',
              transition: 'all 0.15s ease',
              cursor: 'pointer',
              flexShrink: 0,
              border: 'none',
              padding: 0
            }}
          >
            <CloseIcon size={12} />
          </button>
        )}
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

export default LoginInput;
