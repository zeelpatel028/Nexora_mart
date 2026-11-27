import React from 'react';

/**
 * BrandLogo component - displays 3D M logo, NEXORA MART typography, and tagline
 * Specifications:
 * - Logo size: 92x92 dp with 24 dp rounded corners
 * - Title: 26sp, font-weight 500 (medium), letter-spacing 1px; "NEXORA" in dark navy, "MART" in orange
 * - Tagline: 12sp, muted gray
 * - Centered horizontally and vertically as ONE group
 */
export const BrandLogo = ({ 
  brandName = 'TULSI MART', 
  tagline = 'Smart Shopping, Delivered Fresh',
  size = 92,
  textSize = 26,
  showTitle = true,
  showTagline = true,
  className = ''
}) => {
  const parts = (brandName || 'TULSI MART').split(' ');
  const firstWord = parts[0] || 'TULSI';
  const restWords = parts.slice(1).join(' ') || 'MART';

  return (
    <div 
      className={`nexora-brand-logo-container ${className}`}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        textAlign: 'center'
      }}
    >
      {/* 1. 92x92 Logo with 24px Rounded Corners */}
      <div 
        className="nexora-logo-image-wrapper"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: showTitle ? '8px' : '0'
        }}
      >
        <img 
          src="/logo-m.png" 
          alt={`${brandName} Logo`} 
          onError={(e) => {
            if (!e.target.src.endsWith('/logo.png')) {
              e.target.src = '/logo.png';
            }
          }}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '24px',
            objectFit: 'contain',
            display: 'block',
            filter: 'drop-shadow(0 8px 20px rgba(255, 106, 26, 0.22))'
          }} 
        />
      </div>

      {/* 2. Title: 26sp, Medium Weight (500), Letter Spacing 1px */}
      {showTitle && (
        <h1 
          className="nexora-brand-title"
          style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            fontSize: `${textSize}px`,
            fontWeight: 500,
            letterSpacing: '1px',
            margin: 0,
            lineHeight: 1.2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <span style={{ color: 'var(--text-navy, #0B0B2B)', transition: 'color 0.25s ease' }}>{firstWord}</span>
          <span style={{ color: '#FF6A1A', fontWeight: 600 }}>{restWords}</span>
        </h1>
      )}

      {/* 3. Small Tagline: 12sp, Muted Gray */}
      {showTagline && tagline && (
        <p
          className="nexora-brand-tagline"
          style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            fontSize: '12px',
            fontWeight: 400,
            color: 'var(--text-muted, #6B6F80)',
            margin: '4px 0 0 0',
            letterSpacing: '0.2px',
            lineHeight: 1.3,
            transition: 'color 0.25s ease'
          }}
        >
          {tagline}
        </p>
      )}
    </div>
  );
};

export default BrandLogo;
