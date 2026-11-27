import React from 'react';

/**
 * Common Button Component
 * Supports brand orange-yellow gradient, outline, neutral variants, and loading spinners
 */
export const Button = ({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'outline' | 'secondary' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  isLoading = false,
  fullWidth = false,
  onClick,
  className = '',
  style = {},
  id,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'linear-gradient(90deg, #FF5722 0%, #FF781E 45%, #FFB52E 100%)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 8px 24px -2px rgba(255, 87, 34, 0.40)',
          borderRadius: '28px'
        };
      case 'outline':
        return {
          backgroundColor: '#ffffff',
          border: '1.5px solid var(--border-light, #E5E7EB)',
          color: 'var(--text-primary, #101A36)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
          borderRadius: '28px'
        };
      case 'secondary':
        return {
          backgroundColor: '#F3F4F6',
          border: '1px solid #E5E7EB',
          color: '#334155',
          borderRadius: '28px'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          border: 'none',
          color: '#FF5722',
          borderRadius: '28px'
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { height: '40px', padding: '0 16px', fontSize: '13.5px' };
      case 'lg':
        return { height: '54px', padding: '0 28px', fontSize: '16px' };
      case 'md':
      default:
        return { height: '52px', padding: '0 24px', fontSize: '15px' };
    }
  };

  const baseStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    fontWeight: 700,
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    letterSpacing: '0.01em',
    width: fullWidth ? '100%' : 'auto',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.75 : 1,
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    userSelect: 'none',
    ...getSizeStyles(),
    ...getVariantStyles(),
    ...style
  };

  return (
    <button
      id={id}
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      style={baseStyles}
      className={`common-button btn-${variant} ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="spinner-border spinner-border-sm text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
