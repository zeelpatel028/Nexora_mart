import React, { useEffect } from 'react';
import { CloseIcon } from '../branding/Icons';

/**
 * Reusable Modal Dialog Component
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '420px',
  id
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id={id}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth,
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '6px',
            borderRadius: '50%',
            color: '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CloseIcon size={20} />
        </button>

        {title && (
          <h3
            style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: subtitle ? '6px' : '16px',
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}
          >
            {title}
          </h3>
        )}

        {subtitle && (
          <p
            style={{
              fontSize: '13.5px',
              color: '#64748b',
              marginBottom: '20px',
              lineHeight: 1.5,
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}
          >
            {subtitle}
          </p>
        )}

        {children}
      </div>
    </div>
  );
};

export default Modal;
