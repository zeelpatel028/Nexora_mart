import React from 'react';

/**
 * Organic fluid wave for the Desktop left hero panel (Image 1)
 * Includes:
 * 1. Deep atmospheric under-layer
 * 2. Secondary translucent fluid wave layer
 * 3. Main sweeping rich gradient wave (purple -> magenta -> orange)
 * 4. Distinct glowing linear wave line along the wave crest
 */
export const DesktopLeftWave = ({ height = '42%', style = {} }) => {
  return (
    <div 
      className="desktop-left-wave-container"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        borderBottomLeftRadius: 'inherit',
        ...style
      }}
    >
      <svg
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'block'
        }}
        viewBox="0 0 500 240"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="desktopWaveGrad" x1="0" y1="240" x2="480" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4c1d95" />
            <stop offset="18%" stopColor="#7c3aed" />
            <stop offset="38%" stopColor="#c026d3" />
            <stop offset="55%" stopColor="#e11d48" />
            <stop offset="78%" stopColor="#ea580c" />
            <stop offset="95%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>

          <linearGradient id="secondaryWaveGrad" x1="0" y1="240" x2="500" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6d28d9" stopOpacity="0.75" />
            <stop offset="40%" stopColor="#d946ef" stopOpacity="0.65" />
            <stop offset="75%" stopColor="#f43f5e" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="linearWaveLineGrad" x1="0" y1="140" x2="500" y2="195" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="30%" stopColor="#ec4899" />
            <stop offset="60%" stopColor="#f97316" />
            <stop offset="90%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="deepPurpleAccent" x1="0" y1="240" x2="200" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#311068" />
            <stop offset="45%" stopColor="#6d28d9" />
            <stop offset="100%" stopColor="#c026d3" stopOpacity="0.4" />
          </linearGradient>

          <radialGradient id="coralGlow" cx="80%" cy="85%" r="70%">
            <stop offset="0%" stopColor="#ea580c" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          <filter id="lineGlow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ellipse cx="380" cy="200" rx="200" ry="80" fill="url(#coralGlow)" />

        <path
          d="M 0 170
             C 60 185, 120 210, 190 225
             C 240 235, 290 240, 340 240
             L 0 240 Z"
          fill="url(#deepPurpleAccent)"
        />

        <path
          d="M 0 135
             C 45 150, 85 175, 135 195
             C 200 220, 280 200, 350 178
             C 405 162, 455 172, 500 188
             L 500 240
             L 0 240 Z"
          fill="url(#secondaryWaveGrad)"
        />

        <path
          d="M 0 148
             C 50 162, 90 187, 140 207
             C 210 234, 290 212, 360 192
             C 410 177, 460 187, 500 202
             L 500 240
             L 0 240 Z"
          fill="url(#desktopWaveGrad)"
        />

        <path
          d="M 0 148
             C 50 162, 90 187, 140 207
             C 210 234, 290 212, 360 192
             C 410 177, 460 187, 500 202"
          stroke="url(#linearWaveLineGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          filter="url(#lineGlow)"
        />
      </svg>
    </div>
  );
};

export default DesktopLeftWave;
