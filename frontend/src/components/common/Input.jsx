import React, { useState } from 'react';
import { CloseIcon } from '../branding/Icons';

/**
 * Reusable Common Input Component
 */
export const Input = ({
  id,
  type = 'text',
  value = '',
  onChange,
  placeholder = '',
  icon: IconComponent,
  rightElement,
  error = '',
  showClear = false,
  onClear,
  autoComplete,
  disabled = false,
  required = false,
  style = {},
  containerStyle = {},
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerBaseStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: '50px',
    borderRadius: '14px',
    border: `1.5px solid ${error ? '#ef4444' : isFocused ? '#0075ff' : '#e2e8f0'}`,
    backgroundColor: '#ffffff',
    padding: '0 16px',
    boxShadow: isFocused ? '0 0 0 3.5px rgba(0, 117, 255, 0.12)' : '0 1px 3px rgba(15, 23, 42, 0.02)',
    transition: 'all 0.2s ease',
    ...containerStyle
  };

  const inputStyle = {
    width: '100%',
    height: '100%',
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14.5px',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: '#0f172a',
    fontWeight: 500,
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0,
    ...style
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={containerBaseStyle}>
        {IconComponent && (
          <div style={{ marginRight: '12px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {React.isValidElement(IconComponent) ? IconComponent : <IconComponent color={isFocused ? '#0075ff' : '#94a3b8'} size={19} />}
          </div>
        )}

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={inputStyle}
          {...props}
        />

        {showClear && value && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear input"
            style={{
              marginLeft: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              transition: 'all 0.15s ease',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <CloseIcon size={13} color="currentColor" />
          </button>
        )}

        {rightElement && (
          <div style={{ marginLeft: '8px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <span style={{ display: 'block', marginTop: '6px', fontSize: '12.5px', color: '#b91c1c', fontWeight: 500, paddingLeft: '4px' }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
