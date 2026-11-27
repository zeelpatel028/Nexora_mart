/**
 * Tulsi Mart Brand Design Tokens & Colors
 * Unified Orange & White Theme System (Light & Dark Mode)
 */
export const Palette = {
  // Primary Orange + White Design System
  primaryOrange: '#F57C00',
  secondaryOrange: '#FF9800',
  lightOrange: '#FFF3E0',
  darkOrange: '#E65100',
  primaryHover: '#EF6C00',
  white: '#FFFFFF',
  mainBackground: '#F8F9FC',
  primaryText: '#212121',
  secondaryText: '#757575',
  mutedText: '#9E9E9E',

  // Semantic Status Colors
  success: '#2EAD64',
  successLight: '#EAF8F0',
  error: '#E53935',
  errorLight: '#FFEBEE',
  warning: '#F9A825',
  warningLight: '#FFF8E1',
  info: '#2196F3',
  infoLight: '#E3F2FD',

  // Domain-Specific Meaningful Icon Colors
  iconColors: {
    home: '#F57C00',      // Orange
    dashboard: '#F57C00', // Orange
    products: '#2196F3',  // Blue
    inventory: '#2196F3', // Blue
    customers: '#2EAD64', // Green
    khata: '#2EAD64',     // Green
    billing: '#8B5CF6',   // Purple
    orders: '#8B5CF6',    // Purple
    reports: '#00897B',   // Teal
    account: '#00897B',   // Teal
    settings: '#64748B',  // Grey
    expenses: '#E53935',  // Red
    suppliers: '#F57C00', // Orange
  },
};

export const Colors = {
  // Brand Orange System
  primary: Palette.primaryOrange,
  primaryOrange: Palette.primaryOrange,
  secondaryOrange: Palette.secondaryOrange,
  lightOrange: Palette.lightOrange,
  darkOrange: Palette.darkOrange,
  primaryHover: Palette.primaryHover,
  primaryLight: Palette.lightOrange,
  secondary: Palette.secondaryOrange,
  secondaryLight: '#FFE0B2',
  white: Palette.white,
  background: Palette.mainBackground,
  darkText: Palette.primaryText,
  secondaryText: Palette.secondaryText,
  mutedText: Palette.mutedText,

  // Ledger / Khata Semantic Helpers
  gotGreen: Palette.success,
  gotGreenLight: Palette.successLight,
  giveRed: Palette.error,
  giveRedLight: Palette.errorLight,

  // Gradient Stops
  gradientStart: '#FF9800',
  gradientMid: '#F57C00',
  gradientEnd: '#E65100',

  // Status
  success: Palette.success,
  successLight: Palette.successLight,
  error: Palette.error,
  errorLight: Palette.errorLight,
  warning: Palette.warning,
  warningLight: Palette.warningLight,
  info: Palette.info,
  infoLight: Palette.infoLight,

  // Icon Semantics
  iconColors: Palette.iconColors,

  // Flat legacy surface defaults
  border: '#E8ECF2',
  borderLight: '#F1F4F9',
  cardBg: Palette.white,
  cardBorder: '#ECEFF5',
  inputBg: Palette.white,
  inputBorder: '#DFE4EC',

  // Light Mode Tokens
  light: {
    background: '#F8F9FC',
    pageBg: '#F8F9FC',
    surface: '#FFFFFF',
    surfaceSubtle: '#FFF3E0',
    card: '#FFFFFF',
    cardBg: '#FFFFFF',
    cardBorder: '#ECEFF5',
    cardShadow: 'rgba(15, 23, 42, 0.06)',
    border: '#E6EAF0',
    borderLight: '#F1F4F9',
    divider: '#ECEFF5',
    textPrimary: '#212121',
    textSecondary: '#757575',
    textMuted: '#9E9E9E',
    textPlaceholder: '#9E9E9E',
    inputBg: '#FFFFFF',
    inputBorder: '#DFE4EC',
    inputBorderFocused: '#F57C00',
    socialBg: '#FFFFFF',
    socialBorder: '#E6EAF0',
    socialText: '#212121',
    toggleBg: '#FFFFFF',
    toggleBorder: '#E6EAF0',
    badgeOrangeBg: '#FFF3E0',
    badgeOrangeText: '#E65100',
    tabBarBg: '#FFFFFF',
    tabBarBorder: '#ECEFF5',
  },

  // Dark Mode Tokens
  dark: {
    background: '#0F141D',
    pageBg: '#0F141D',
    surface: '#1A2130',
    surfaceSubtle: '#232C3D',
    card: '#1A2130',
    cardBg: '#1A2130',
    cardBorder: '#2A3447',
    cardShadow: 'rgba(0, 0, 0, 0.45)',
    border: '#2A3447',
    borderLight: '#232C3D',
    divider: '#252E3F',
    textPrimary: '#F8FAFC',
    textSecondary: '#A3B1C6',
    textMuted: '#6E7D95',
    textPlaceholder: '#6E7D95',
    inputBg: '#151B26',
    inputBorder: '#2E3A4F',
    inputBorderFocused: '#FF9800',
    socialBg: '#1A2130',
    socialBorder: '#2A3447',
    socialText: '#F8FAFC',
    toggleBg: '#1A2130',
    toggleBorder: '#2A3447',
    badgeOrangeBg: '#3D240E',
    badgeOrangeText: '#FFB74D',
    tabBarBg: '#1A2130',
    tabBarBorder: '#2A3447',
  },
};

export default Colors;
