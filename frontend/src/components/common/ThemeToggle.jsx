import React from 'react';
import { useTheme } from '../../contexts';

/**
 * ThemeToggle Component
 * Sleek floating frosted pill allowing seamless switching between
 * System Default, Light mode, and Dark mode.
 */
export const ThemeToggle = ({ className = '', style = {} }) => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`nexora-theme-toggle ${className}`}
      title={`Current Theme: ${isDark ? 'Dark' : 'Light'} (${theme === 'system' ? 'System' : 'Manual'}) - Click to toggle`}
      aria-label="Toggle dark and light mode"
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 999,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '7px 12px',
        borderRadius: '9999px',
        border: isDark ? '1px solid rgba(255, 122, 26, 0.35)' : '1px solid rgba(255, 106, 26, 0.25)',
        backgroundColor: isDark ? 'rgba(20, 25, 36, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        color: isDark ? '#F8FAFC' : '#0B0B2B',
        fontSize: '12px',
        fontWeight: 600,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        cursor: 'pointer',
        boxShadow: isDark
          ? '0 4px 16px rgba(0, 0, 0, 0.45), 0 0 12px rgba(255, 106, 26, 0.15)'
          : '0 4px 16px rgba(255, 140, 60, 0.15)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        userSelect: 'none',
        outline: 'none',
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
        e.currentTarget.style.borderColor = '#FF7A1A';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.borderColor = isDark ? 'rgba(255, 122, 26, 0.35)' : 'rgba(255, 106, 26, 0.25)';
      }}
    >
      {/* Icon */}
      {isDark ? (
        // Sun icon for switching to light
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFB82E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" fill="#FFB82E" fillOpacity="0.2" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        // Moon icon for switching to dark
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#FF6A1A" fillOpacity="0.15" />
        </svg>
      )}
      <span>{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
};

export default ThemeToggle;

