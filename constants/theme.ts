// ParkSpace — Premium Dark Design System
// Theme: Dark luxury with electric accents — "Smart City Parking"

export const Colors = {
  // Backgrounds (Dark theme)
  background: '#0A0A14',
  surface: '#1C1C2E',
  card: '#12121F',
  surfaceElevated: '#252540',

  // Primary
  primary: '#6C63FF',
  primaryDark: '#5A52D5',
  primaryLight: '#8B83FF',
  primaryGlow: 'rgba(108, 99, 255, 0.3)',

  // Secondary / Accent
  accent: '#00D4AA',
  accentDark: '#00B88F',
  accentLight: 'rgba(0, 212, 170, 0.15)',

  // Status
  success: '#00D4AA',
  successLight: 'rgba(0, 212, 170, 0.15)',
  warning: '#FFB547',
  warningLight: 'rgba(255, 181, 71, 0.15)',
  error: '#FF4757',
  errorLight: 'rgba(255, 71, 87, 0.15)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#8892A4',
  textMuted: '#4A5568',
  textInverse: '#0A0A14',

  // Borders
  border: '#1E2A3A',
  borderLight: '#2A3A4E',

  // Vehicle type colors (from pricing.ts VEHICLE_META)
  car: '#2563EB',
  bike: '#16A34A',
  rickshaw: '#D97706',

  // Gradient presets
  gradientPrimary: ['#6C63FF', '#8B83FF'],
  gradientAccent: ['#6C63FF', '#00D4AA'],
  gradientDark: ['#12121F', '#0A0A14'],
  gradientCard: ['#12121F', '#1C1C2E'],
  gradientCTA: ['#6C63FF', '#8B83FF'],
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  xxxl: 32,
  hero: 42,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  accentGlow: {
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const ParkingConfig = {
  lotName: 'Durvesh Parking',
  locationLabel: 'Durvesh Open Parking, Sector 12',
  currency: '₹',
  openTime: '00:00',
  closeTime: '24:00',
  is24x7: true,
};
