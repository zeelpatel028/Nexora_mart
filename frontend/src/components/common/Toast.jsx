import React, { useEffect } from 'react';

export const Toast = ({ message, type = 'success', onClose, duration = 3500 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const isSuccess = type === 'success';

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        backgroundColor: isSuccess ? '#0f172a' : '#991b1b',
        color: '#ffffff',
        padding: '12px 22px',
        borderRadius: '30px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '14px',
        fontWeight: 600,
        letterSpacing: '0.01em',
        animation: 'fadeIn 0.25s ease-out forwards',
        border: '1px solid rgba(255, 255, 255, 0.15)'
      }}
    >
      <div 
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: isSuccess ? '#10b981' : '#f87171'
        }} 
      />
      <span>{message}</span>
      <button
        onClick={onClose}
        aria-label="Dismiss toast"
        style={{
          marginLeft: '8px',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '16px',
          lineHeight: 1,
          cursor: 'pointer'
        }}
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
