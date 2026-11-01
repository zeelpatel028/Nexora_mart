import React, { useEffect, useState } from 'react';
import './Splash.css';

/**
 * Nexora Mart Splash Screen (Web)
 * Exactly reproduces Image 2 "same to same":
 * - Light warm cream background (#FFF9F3)
 * - Top-left organic glossy peach & orange waves
 * - Bottom-right organic glowing peach & orange waves
 * - Centered 3D "M" Logo
 * - Bold uppercase wordmark: "NEXORA" (Dark Navy) + "MART" (Vibrant Orange)
 * - Rotating circular gradient loading spinner (peach to vibrant orange)
 * - Bold status text: "Starting App..." in Dark Navy
 */
export const SplashScreen = ({
  onComplete,
  brandName = 'NEXORA MART',
  autoNavigateDelay = 2200
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!autoNavigateDelay) return;
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 300);
    }, autoNavigateDelay);

    return () => clearTimeout(timer);
  }, [autoNavigateDelay, onComplete]);

  const handleScreenClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 200);
  };

  const parts = (brandName || 'NEXORA MART').split(' ');
  const firstWord = parts[0] || 'NEXORA';
  const restWords = parts.slice(1).join(' ') || 'MART';

  return (
    <div 
      className={`nmart-splash-screen ${isExiting ? 'splash-exit' : ''}`}
      onClick={handleScreenClick}
      title="Click anywhere to continue"
    >
      {/* Background Waves Matching Image 2 */}
      <svg className="splash-waves-svg" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <defs>
          <linearGradient id="splashTopPeach" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD5A5" />
            <stop offset="100%" stopColor="#FFEAD4" />
          </linearGradient>
          <linearGradient id="splashTopOrange" x1="0%" y1="0%" x2="80%" y2="80%">
            <stop offset="0%" stopColor="#FF6214" />
            <stop offset="50%" stopColor="#FF852E" />
            <stop offset="100%" stopColor="#FFA652" />
          </linearGradient>
          <linearGradient id="splashBottomPeach" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFE2BF" />
            <stop offset="50%" stopColor="#FFD09E" />
            <stop offset="100%" stopColor="#FFC085" />
          </linearGradient>
          <linearGradient id="splashBottomOrange" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF5F12" />
            <stop offset="50%" stopColor="#FF7E26" />
            <stop offset="100%" stopColor="#FFA84E" />
          </linearGradient>
          <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6A1A" stopOpacity="1" />
            <stop offset="40%" stopColor="#FF8A35" stopOpacity="0.8" />
            <stop offset="75%" stopColor="#FFB56B" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFD5A5" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Top-Left Peach Under-layer */}
        <path
          d="M 0 0 L 440 0 C 380 80, 200 170, 0 230 Z"
          fill="url(#splashTopPeach)"
        />
        {/* Top-Left Orange Wave */}
        <path
          d="M 0 0 L 300 0 C 240 60, 140 130, 0 180 Z"
          fill="url(#splashTopOrange)"
        />

        {/* Bottom-Right Peach Under-layer */}
        <path
          d="M 0 900 C 250 860, 600 940, 1000 810 L 1000 1000 L 0 1000 Z"
          fill="url(#splashBottomPeach)"
        />
        {/* Bottom-Right Orange Wave */}
        <path
          d="M 0 940 C 300 920, 650 980, 1000 860 L 1000 1000 L 0 1000 Z"
          fill="url(#splashBottomOrange)"
        />
      </svg>

      {/* Center Branding & Loading Spinner */}
      <div className="splash-center-content">
        <div className="splash-logo-wrapper">
          <img 
            src="/logo-m.png" 
            alt="Nexora Mart Logo" 
            className="splash-logo-img"
            onError={(e) => {
              if (!e.target.src.endsWith('/logo.png')) {
                e.target.src = '/logo.png';
              }
            }}
          />
        </div>

        <h1 className="splash-brand-title">
          <span style={{ color: '#0B0B2B' }}>{firstWord}</span>
          <span style={{ color: '#FF6A1A', marginLeft: '8px' }}>{restWords}</span>
        </h1>

        <div className="splash-spinner-wrapper">
          <svg className="splash-spinner-svg" viewBox="0 0 50 50">
            <circle
              className="splash-spinner-track"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="#FFE8D2"
              strokeWidth="4"
              opacity="0.4"
            />
            <circle
              className="splash-spinner-arc"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="url(#spinnerGradient)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeDasharray="90 150"
            />
          </svg>
        </div>

        <p className="splash-status-text">Starting App...</p>
      </div>
    </div>
  );
};

export default SplashScreen;
