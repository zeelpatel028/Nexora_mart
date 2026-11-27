import React from 'react';
import { useResponsive } from './useResponsive';

/**
 * Render children only on Desktop / Website viewports (>= 1024px)
 */
export const DesktopOnly = ({ children }) => {
  const { isDesktop } = useResponsive();
  return isDesktop ? <>{children}</> : null;
};

/**
 * Render children only on Tablet viewports (600px - 1023px)
 */
export const TabletOnly = ({ children }) => {
  const { isTablet } = useResponsive();
  return isTablet ? <>{children}</> : null;
};

/**
 * Render children only on Mobile viewports (< 600px)
 */
export const MobileOnly = ({ children }) => {
  const { isMobile } = useResponsive();
  return isMobile ? <>{children}</> : null;
};

/**
 * AdaptiveRender
 * Seamlessly renders the corresponding view based on the current device:
 * - website / desktop
 * - tablet
 * - mobile
 */
export const AdaptiveRender = ({ website, desktop, tablet, mobile }) => {
  const { isMobile, isTablet } = useResponsive();

  if (isMobile && mobile) {
    return <>{mobile}</>;
  }

  if (isTablet && tablet) {
    return <>{tablet}</>;
  }

  // Desktop / Website fallback
  return <>{website || desktop}</>;
};
