import React from 'react';
import { CheckIcon } from '../branding/Icons';

/**
 * RememberMe Checkbox Component
 * - Matched 1:1 to Reference Screenshot (media_1793531577699_4418a210.jpg)
 * - Orange filled square with rounded corners (#FF6A1A), white checkmark
 * - Label: #8E9CAE / #94A3B8 in dark mode
 */
export const RememberMe = ({
  checked = true,
  onChange,
  id = 'keep-signed-in',
  label = 'Keep me signed in'
}) => {
  return (
    <label
      htmlFor={id}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '9px',
        cursor: 'pointer',
        userSelect: 'none',
        fontSize: '13px',
        color: 'var(--text-secondary, #8E9CAE)',
        fontWeight: 400,
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange && onChange(e.target.checked)}
        style={{ display: 'none' }}
      />
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '5px',
          border: checked ? 'none' : '1.5px solid var(--border-light, #283348)',
          backgroundColor: checked ? '#FF6A1A' : 'var(--bg-input, #1B2232)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease',
          boxShadow: checked ? '0 2px 6px rgba(255, 106, 26, 0.25)' : 'none',
          flexShrink: 0
        }}
      >
        {checked && <CheckIcon size={13} color="#FFFFFF" />}
      </div>
      <span>{label}</span>
    </label>
  );
};

export default RememberMe;
