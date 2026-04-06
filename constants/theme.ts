// Durvesh Parking — Design System
export const Colors = {
  // Primary palette
  primary: '#6C63FF',
  primaryDark: '#5A52D5',
  primaryLight: '#8B85FF',
  primaryGlow: 'rgba(108, 99, 255, 0.3)',

  // Accent
  accent: '#00D9FF',
  accentDark: '#00B8D9',

  // Success / Warning / Error
  success: '#00C853',
  successLight: 'rgba(0, 200, 83, 0.15)',
  warning: '#FFB300',
  warningLight: 'rgba(255, 179, 0, 0.15)',
  error: '#FF5252',
  errorLight: 'rgba(255, 82, 82, 0.15)',

  // Backgrounds (Dark theme)
  background: '#0F0F1A',
  surface: '#1A1A2E',
  surfaceLight: '#252540',
  surfaceElevated: '#2A2A45',
  card: '#1E1E35',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0B8',
  textMuted: '#6B6B80',
  textInverse: '#0F0F1A',

  // Borders
  border: '#2E2E48',
  borderLight: '#3A3A55',

  // Vehicle type colors
  car: '#FF6B6B',
  bike: '#4ECDC4',
  rickshaw: '#FFE66D',

  // Gradient presets
  gradientPrimary: ['#6C63FF', '#8B85FF'],
  gradientAccent: ['#00D9FF', '#00B8D9'],
  gradientDark: ['#1A1A2E', '#0F0F1A'],
  gradientCard: ['#1E1E35', '#252540'],
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
  xl: 24,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  xxxl: 34,
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
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
};

export const VehicleConfig = {
  car: { name: 'Car', icon: '🚗', color: Colors.car, slots: 2, rate: 100 },
  bike: { name: 'Bike', icon: '🏍️', color: Colors.bike, slots: 5, rate: 50 },
  rickshaw: { name: 'Rickshaw', icon: '🛺', color: Colors.rickshaw, slots: 2, rate: 30 },
};

export const ParkingConfig = {
  lotName: 'Durvesh Parking',
  currency: '₹',
  openTime: '00:00',
  closeTime: '24:00',
  is24x7: true,
};
