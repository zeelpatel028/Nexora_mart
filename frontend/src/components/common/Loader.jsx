import React from 'react';

/**
 * Reusable Loading Spinner
 */
export const Loader = ({ size = 24, color = '#0075ff', text = '' }) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          border: `${Math.max(2, size / 10)}px solid rgba(0, 117, 255, 0.2)`,
          borderTopColor: color,
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite'
        }}
      />
      {text && (
        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
          {text}
        </span>
      )}
    </div>
  );
};

export default Loader;
