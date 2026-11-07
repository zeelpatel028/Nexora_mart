/**
 * Nexora Mart Brand Design Tokens & Colors
 * Matched 1:1 with Web Specifications & Color Design System
 */
export const Colors = {
  // Brand Orange System
  primary: '#FF6A1A',          // Signature vibrant Nexora Orange (Web match)
  primaryOrange: '#FF6A1A',
  secondaryOrange: '#FF9800',   // Warm secondary orange
  lightOrange: '#FFF3E0',       // Soft orange highlight
  darkOrange: '#E65100',        // Deep contrast orange
  primaryHover: '#E5570D',
  primaryLight: '#FFF0E8',
  secondary: '#FFB82E',
  secondaryLight: '#FFCA58',

  // Gradient stops
  gradientStart: '#FF5B18',
  gradientMid: '#FF781E',
  gradientEnd: '#FFA126',

  // Status & Utility
  success: '#10B981',
  successLight: '#ECFDF5',
  error: '#DC2626',
  errorLight: '#FEF2F2',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  info: '#3B82F6',
  infoLight: '#EFF6FF',

  // Light Theme (Exact Web & Design Spec Match)
  light: {
    background: '#FFF9F3',      // Soft cream backdrop from website
    pageBg: '#FFF9F3',
    surface: '#FFFFFF',         // Card white surface
    surfaceSubtle: '#F8F9FA',
    border: '#E8ECEF',          // Subtle divider/input border
    borderLight: '#E5E7EB',
    textPrimary: '#0B0B2B',     // Deep Navy brand text
    textSecondary: '#5F6375',   // Subtitle text
    textMuted: '#757575',
    textPlaceholder: '#768499',
    inputBg: '#FFFFFF',
    inputBorder: '#E8ECEF',
    cardBg: '#FFFFFF',
    cardBorder: 'rgba(255, 255, 255, 0.90)',
    cardShadow: 'rgba(255, 106, 26, 0.12)',
    divider: '#E5DFD7',
    socialBg: '#FFFFFF',
    socialBorder: '#E8ECEF',
    socialText: '#0B0B2B',
  },

  // Dark Theme (Exact Web & Design Spec Match)
  dark: {
    background: '#111520',      // Deep dark slate-navy
    pageBg: '#111520',
    surface: '#181E2B',         // Dark slate solid card
    surfaceSubtle: '#1F2738',
    border: '#283348',          // Slate input border
    borderLight: '#262E3F',     // Card border
    textPrimary: '#FFFFFF',     // Clean white text
    textSecondary: '#8E9CAE',   // Muted grey subtitle
    textMuted: '#BDBDBD',
    textPlaceholder: '#768499',
    inputBg: '#1B2232',         // Deep slate-navy input field
    inputBorder: '#283348',
    cardBg: '#181E2B',
    cardBorder: '#262E3F',
    cardShadow: 'rgba(0, 0, 0, 0.65)',
    divider: '#252D3E',
    socialBg: '#1B2232',
    socialBorder: '#283348',
    socialText: '#FFFFFF',
  },
};

export default Colors;
