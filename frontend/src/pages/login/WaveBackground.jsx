import React from 'react';
import { useResponsive } from '../../responsive';
import { useTheme } from '../../contexts';

/**
 * WaveBackground
 * Soft multi-layered organic wave background matching NEXORA MART visual specifications:
 * - Light Mode: Base cream (#FFF9F3) with warm peach-to-orange glossy waves
 * - Dark Mode: Exactly matches screenshot: Base (#111520), top-right amber/orange waves,
 *   left-middle amber wave, and bottom-right glowing orange wave!
 */
export const WaveBackground = () => {
  const { isDesktop } = useResponsive();
  const { isDark } = useTheme();

  return (
    <div
      className="wave-background-root"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        backgroundColor: isDark ? '#111520' : '#FFF9F3',
        transition: 'background-color 0.3s ease',
        overflow: 'hidden'
      }}
      aria-hidden="true"
    >
      {isDesktop ? (
        /* ================= DESKTOP SVG (>= 768px) ================= */
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block'
          }}
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Top-Right Blob Gradient */}
            <linearGradient id="webTopRightGrad" x1="100%" y1="0%" x2="25%" y2="80%">
              {isDark ? (
                <>
                  <stop offset="0%" stopColor="#FF7A1A" stopOpacity="0.55" />
                  <stop offset="50%" stopColor="#CC5200" stopOpacity="0.40" />
                  <stop offset="100%" stopColor="#501F00" stopOpacity="0.15" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#FFB066" stopOpacity="0.85" />
                  <stop offset="55%" stopColor="#FFC78A" stopOpacity="0.80" />
                  <stop offset="100%" stopColor="#FFD9A8" stopOpacity="0.55" />
                </>
              )}
            </linearGradient>

            {/* Left Side Middle Wave Band */}
            <linearGradient id="webLeftMidBandGrad" x1="0%" y1="30%" x2="70%" y2="70%">
              {isDark ? (
                <>
                  <stop offset="0%" stopColor="#E65A15" stopOpacity="0.50" />
                  <stop offset="60%" stopColor="#8C2E00" stopOpacity="0.30" />
                  <stop offset="100%" stopColor="#111520" stopOpacity="0" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#FFDDB7" stopOpacity="0.65" />
                  <stop offset="50%" stopColor="#FFE3C2" stopOpacity="0.60" />
                  <stop offset="100%" stopColor="#FFF9F3" stopOpacity="0" />
                </>
              )}
            </linearGradient>

            {/* Bottom-Right Glowing Orange Wave (Matches Screenshot) */}
            <linearGradient id="webBottomRightGrad" x1="100%" y1="100%" x2="30%" y2="40%">
              {isDark ? (
                <>
                  <stop offset="0%" stopColor="#FFA026" stopOpacity="0.90" />
                  <stop offset="45%" stopColor="#FF6A1A" stopOpacity="0.85" />
                  <stop offset="85%" stopColor="#CC5200" stopOpacity="0.40" />
                  <stop offset="100%" stopColor="#111520" stopOpacity="0" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#FFB347" stopOpacity="0.75" />
                  <stop offset="45%" stopColor="#FFC36B" stopOpacity="0.65" />
                  <stop offset="85%" stopColor="#FFD08A" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#FFF9F3" stopOpacity="0" />
                </>
              )}
            </linearGradient>
          </defs>

          {/* Top-Right Peach/Orange Waves */}
          <path
            d="M 1040 0 C 1090 170, 1220 270, 1440 220 L 1440 0 Z"
            fill="url(#webTopRightGrad)"
          />

          {/* Left Middle Wave Band */}
          <path
            d="M -40 330 C 140 350, 320 460, 520 440 C 700 420, 840 520, 1020 600 L -40 600 Z"
            fill="url(#webLeftMidBandGrad)"
          />

          {/* Bottom-Right Prominent Glowing Orange Wave */}
          <path
            d="M 1440 480 C 1280 540, 1100 680, 1120 900 L 1440 900 Z"
            fill="url(#webBottomRightGrad)"
          />
        </svg>
      ) : (
        /* ================= MOBILE SVG (< 768px) ================= */
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block'
          }}
          viewBox="0 0 390 844"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Mobile Top-Right Deep Amber Layer */}
            <linearGradient id="mobTopRightDeepGrad" x1="100%" y1="0%" x2="0%" y2="80%">
              {isDark ? (
                <>
                  <stop offset="0%" stopColor="#55220A" stopOpacity="0.55" />
                  <stop offset="60%" stopColor="#351405" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#111520" stopOpacity="0" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#FFE0B8" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#FFF9F3" stopOpacity="0" />
                </>
              )}
            </linearGradient>

            {/* Mobile Top-Right Glowing Amber/Orange Wave */}
            <linearGradient id="mobTopRightGrad" x1="100%" y1="0%" x2="15%" y2="85%">
              {isDark ? (
                <>
                  <stop offset="0%" stopColor="#FF7A1A" stopOpacity="0.65" />
                  <stop offset="50%" stopColor="#CC5200" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#111520" stopOpacity="0" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#FFB066" stopOpacity="0.85" />
                  <stop offset="55%" stopColor="#FFC78A" stopOpacity="0.80" />
                  <stop offset="100%" stopColor="#FFD9A8" stopOpacity="0.55" />
                </>
              )}
            </linearGradient>

            {/* Mobile Left Mid Wave */}
            <linearGradient id="mobLeftMidBandGrad" x1="0%" y1="15%" x2="85%" y2="75%">
              {isDark ? (
                <>
                  <stop offset="0%" stopColor="#D95510" stopOpacity="0.55" />
                  <stop offset="65%" stopColor="#852E04" stopOpacity="0.30" />
                  <stop offset="100%" stopColor="#111520" stopOpacity="0" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#FFDDB7" stopOpacity="0.65" />
                  <stop offset="50%" stopColor="#FFE3C2" stopOpacity="0.60" />
                  <stop offset="100%" stopColor="#FFF9F3" stopOpacity="0" />
                </>
              )}
            </linearGradient>

            {/* Mobile Bottom-Right Prominent Glowing Orange Wave (Matches Screenshot) */}
            <linearGradient id="mobBottomRightGrad" x1="100%" y1="100%" x2="20%" y2="25%">
              {isDark ? (
                <>
                  <stop offset="0%" stopColor="#FFA126" stopOpacity="0.95" />
                  <stop offset="40%" stopColor="#FF6A1A" stopOpacity="0.90" />
                  <stop offset="75%" stopColor="#D6530A" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#111520" stopOpacity="0" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#FFB347" stopOpacity="0.75" />
                  <stop offset="50%" stopColor="#FFC36B" stopOpacity="0.65" />
                  <stop offset="85%" stopColor="#FFD08A" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#FFF9F3" stopOpacity="0" />
                </>
              )}
            </linearGradient>
          </defs>

          {/* 1. Top-Right Deep Amber Layer */}
          <path
            d="M 170 0 C 220 70, 290 140, 390 115 L 390 0 Z"
            fill="url(#mobTopRightDeepGrad)"
          />

          {/* 2. Top-Right Glowing Amber/Orange Curve */}
          <path
            d="M 230 0 C 265 65, 325 120, 390 95 L 390 0 Z"
            fill="url(#mobTopRightGrad)"
          />

          {/* 3. Left Side Middle Ambient Wave */}
          <path
            d="M -20 180 C 80 195, 170 260, 270 240 C 330 225, 360 250, 410 280 L 410 350 L -20 350 Z"
            fill="url(#mobLeftMidBandGrad)"
          />

          {/* 4. Bottom-Right Glowing Orange Wave (Matches Screenshot Corner) */}
          <path
            d="M 390 670 C 330 700, 270 760, 290 844 L 390 844 Z"
            fill="url(#mobBottomRightGrad)"
          />
        </svg>
      )}
    </div>
  );
};

export default WaveBackground;
