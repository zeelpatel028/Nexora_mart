import { useState, useEffect } from 'react';

/**
 * Breakpoints:
 * Screens narrower than 768px: Mobile layout (logo on top, card below)
 * Screens 768px and wider: Desktop 2-column split layout
 */
export const BREAKPOINTS = {
  MOBILE_MAX: 767,
  DESKTOP_MIN: 768
};

export function useResponsive() {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < BREAKPOINTS.DESKTOP_MIN;
  const isDesktop = windowWidth >= BREAKPOINTS.DESKTOP_MIN;

  return {
    windowWidth,
    isMobile,
    isDesktop,
    deviceType: isMobile ? 'mobile' : 'desktop',
    isSmallScreen: isMobile,
    isWebsite: isDesktop
  };
}

export default useResponsive;
