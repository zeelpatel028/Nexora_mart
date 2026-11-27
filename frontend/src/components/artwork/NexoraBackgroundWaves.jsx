import React from 'react';

/**
 * NexoraBackgroundWaves
 * Pixel-perfect background recreation based on login_page_web.png and login_page.png:
 * Base cream #FFF6EC with soft peach and orange wave blobs:
 * - Top-right: soft peach/amber blob
 * - Left-middle: gentle warm wave
 * - Bottom-left: vibrant orange & yellow layered sweeping wave
 * - Bottom-right: soft warm ambient curve
 */
export const NexoraBackgroundWaves = ({ className = '' }) => {
  return (
    <div 
      className={`nexora-bg-waves-wrapper ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        backgroundColor: '#FFF6EC'
      }}
      aria-hidden="true"
    >
      <svg
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0
        }}
        viewBox="0 0 1440 960"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Vibrant Orange Gradient for Bottom Left Wave */}
          <linearGradient id="nmartOrangeWave" x1="0%" y1="100%" x2="65%" y2="35%">
            <stop offset="0%" stopColor="#FF4F18" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#FF6A1A" stopOpacity="0.95" />
            <stop offset="75%" stopColor="#FF8F24" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFB82E" stopOpacity="0.85" />
          </linearGradient>

          {/* Secondary Soft Amber/Yellow Gradient */}
          <linearGradient id="nmartYellowWave" x1="0%" y1="85%" x2="80%" y2="25%">
            <stop offset="0%" stopColor="#FFA426" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#FFB82E" stopOpacity="0.55" />
            <stop offset="85%" stopColor="#FFDE9A" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFF6EC" stopOpacity="0" />
          </linearGradient>

          {/* Left Middle Soft Flow */}
          <linearGradient id="nmartLeftMiddleFlow" x1="0%" y1="50%" x2="40%" y2="50%">
            <stop offset="0%" stopColor="#FFB82E" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#FFD89C" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FFF6EC" stopOpacity="0" />
          </linearGradient>

          {/* Top Left Organic Flow */}
          <linearGradient id="nmartTopLeftFlow" x1="0%" y1="0%" x2="70%" y2="70%">
            <stop offset="0%" stopColor="#FFB82E" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#FFCE85" stopOpacity="0.35" />
            <stop offset="85%" stopColor="#FFE8C4" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FFF6EC" stopOpacity="0" />
          </linearGradient>

          {/* Top Right Ambient Blob */}
          <linearGradient id="nmartTopRightBlob" x1="100%" y1="0%" x2="30%" y2="70%">
            <stop offset="0%" stopColor="#FFC868" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#FFE0AA" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FFF6EC" stopOpacity="0" />
          </linearGradient>

          {/* Bottom Right Ambient Curve */}
          <linearGradient id="nmartBottomRightBlob" x1="100%" y1="100%" x2="40%" y2="50%">
            <stop offset="0%" stopColor="#FFB242" stopOpacity="0.5" />
            <stop offset="55%" stopColor="#FFE0B0" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FFF6EC" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. Top-Left Blob */}
        <path
          d="M -100 -50 
             C 120 -50, 320 60, 300 240 
             C 280 400, 100 440, -50 480 
             Z"
          fill="url(#nmartTopLeftFlow)"
        />

        {/* 2. Top-Right Soft Peach Blob */}
        <path
          d="M 1150 0 
             C 1180 180, 1320 280, 1440 260 
             L 1440 0 
             Z"
          fill="url(#nmartTopRightBlob)"
        />

        {/* 3. Left-Middle Warm Flow */}
        <path
          d="M -50 360 
             C 140 380, 240 500, 120 620 
             C 40 700, -30 680, -50 640 
             Z"
          fill="url(#nmartLeftMiddleFlow)"
        />

        {/* 4. Bottom-Right Ambient Blob */}
        <path
          d="M 1440 660 
             C 1330 690, 1200 800, 1240 960 
             L 1440 960 
             Z"
          fill="url(#nmartBottomRightBlob)"
        />

        {/* 5. Bottom-Left Layer 1: Amber/Yellow Wave */}
        <path
          d="M -30 580 
             C 130 600, 240 720, 400 710 
             C 560 700, 700 830, 880 960 
             L -30 960 
             Z"
          fill="url(#nmartYellowWave)"
        />

        {/* 6. Bottom-Left Layer 2: Vibrant Orange Wave */}
        <path
          d="M -30 680 
             C 100 700, 190 780, 330 790 
             C 480 800, 580 890, 740 960 
             L -30 960 
             Z"
          fill="url(#nmartOrangeWave)"
        />

        {/* 7. Bottom-Left Layer 3: Solid Warm Accent */}
        <path
          d="M -30 780 
             C 80 800, 160 880, 260 890 
             C 380 900, 480 950, 560 960 
             L -30 960 
             Z"
          fill="#FF6A1A"
          fillOpacity="0.8"
        />
      </svg>
    </div>
  );
};

export default NexoraBackgroundWaves;
