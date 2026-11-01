import React from 'react';

/**
 * Top-left fluid organic wave decoration in the Desktop Hero panel
 */
export const WebsiteTopWave = ({ width = '260px', height = '180px', style = {} }) => {
  return (
    <div
      className="website-top-wave-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        borderTopLeftRadius: 'inherit',
        ...style
      }}
    >
      <svg
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
        viewBox="0 0 260 180"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="topWaveGrad1" x1="0" y1="0" x2="260" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#c026d3" stopOpacity="0.75" />
            <stop offset="85%" stopColor="#f43f5e" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="topWaveGrad2" x1="0" y1="0" x2="220" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4c1d95" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#9333ea" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#db2777" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        <path
          d="M 0 0
             L 210 0
             C 170 45, 155 75, 115 110
             C 75 145, 45 155, 0 160
             Z"
          fill="url(#topWaveGrad2)"
        />

        <path
          d="M 0 0
             L 170 0
             C 140 38, 125 65, 90 95
             C 55 125, 30 135, 0 140
             Z"
          fill="url(#topWaveGrad1)"
        />
      </svg>
    </div>
  );
};

export default WebsiteTopWave;
