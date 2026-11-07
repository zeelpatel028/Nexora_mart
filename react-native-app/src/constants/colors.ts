/**
 * Nexora Mart Brand Design Tokens & Colors
 * Pixel-Perfect match with Reference UI Designs (Light & Dark)
 */
export const Colors = {
  // Brand Orange System
  primary: '#FF6A1A',          // Signature vibrant Nexora Orange
  primaryOrange: '#FF6A1A',
  secondaryOrange: '#FF7E26',   // Warm secondary orange
  lightOrange: '#FFF3E0',       // Soft orange highlight
  darkOrange: '#E65100',        // Deep contrast orange
  primaryHover: '#E5570D',
  primaryLight: '#FFF0E8',
  secondary: '#FFB82E',
  secondaryLight: '#FFCA58',

  // Gradient stops
  gradientStart: '#FF7A1A',
  gradientMid: '#FF6A1A',
  gradientEnd: '#FF5400',

  // Status & Utility
  success: '#10B981',
  successLight: '#ECFDF5',
  error: '#DC2626',
  errorLight: '#FEF2F2',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  info: '#3B82F6',
  infoLight: '#EFF6FF',

  // Light Theme (Exact Reference UI Match)
  light: {
    background: '#FFFFFF',      // Pure clean white backdrop from reference UI
    pageBg: '#FFFFFF',
    surface: '#FFFFFF',         // Card white surface
    surfaceSubtle: '#F9FAFB',
    border: '#E5E7EB',          // Subtle divider/input border
    borderLight: '#F3F4F6',
    textPrimary: '#111827',     // Dark bold text
    textSecondary: '#6B7280',   // Muted subtitle text
    textMuted: '#9CA3AF',
    textPlaceholder: '#9CA3AF',
    inputBg: '#FFFFFF',
    inputBorder: '#E5E7EB',
    inputBorderFocused: '#FF6A1A',
    cardBg: '#FFFFFF',
    cardBorder: '#E5E7EB',
    cardShadow: 'rgba(0, 0, 0, 0.05)',
    divider: '#E5E7EB',
    socialBg: '#FFFFFF',
    socialBorder: '#E5E7EB',
    socialText: '#1F2937',
    toggleBg: '#FFFFFF',
    toggleBorder: '#E5E7EB',
  },

  // Dark Theme (Exact Reference UI Match)
  dark: {
    background: '#121316',      // Deep dark sleek charcoal backdrop
    pageBg: '#121316',
    surface: '#1C1E24',         // Dark slate solid card
    surfaceSubtle: '#22252D',
    border: '#2D323E',          // Slate input border
    borderLight: '#262A34',     // Card border
    textPrimary: '#FFFFFF',     // Clean white text
    textSecondary: '#9CA3AF',   // Muted grey subtitle
    textMuted: '#6B7280',
    textPlaceholder: '#6B7280',
    inputBg: '#1C1E24',         // Deep charcoal input field
    inputBorder: '#2D323E',
    inputBorderFocused: '#FF6A1A',
    cardBg: '#1C1E24',
    cardBorder: '#2D323E',
    cardShadow: 'rgba(0, 0, 0, 0.55)',
    divider: '#262C38',
    socialBg: '#1C1E24',
    socialBorder: '#2D323E',
    socialText: '#FFFFFF',
    toggleBg: '#1C1E24',
    toggleBorder: '#2D323E',
  },
};

export default Colors;
