// src/context/ThemeContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Backgrounds
  bgPrimary:      string;
  bgCard:         string;
  bgSurface:      string;
  bgInput:        string;

  // Text
  textPrimary:    string;
  textSecondary:  string;
  textMuted:      string;

  // Accent
  accent:         string;
  accentLight:    string;
  success:        string;
  warning:        string;
  danger:         string;

  // Borders
  border:         string;
  borderFocus:    string;

  // Button
  btnPrimaryBg:   string;    // gradient start (use with btnPrimaryEnd)
  btnPrimaryEnd:  string;    // gradient end
  btnPrimaryText: string;
  btnOutlineText: string;

  // Guest warning
  warningBg:      string;
  warningBorder:  string;
  warningText:    string;

  // Tab bar
  tabBarBg:       string;
  tabBarActive:   string;
  tabBarInactive: string;

  // Status bar
  statusBarStyle: 'light-content' | 'dark-content';

  // Additional utility colors
  surfaceElevated: string;
  primaryGlow:     string;
  successLight:    string;
  warningLightBg:  string;
  errorLight:      string;
  error:           string;
  borderLight:     string;

  // Gradient presets
  gradientPrimary: string[];
  gradientAccent:  string[];
  gradientDark:    string[];
  gradientCard:    string[];
  gradientCTA:     string[];

  // Vehicle colors
  car:       string;
  bike:      string;
  rickshaw:  string;
}

export const DARK_COLORS: ThemeColors = {
  bgPrimary:      '#0A0A14',
  bgCard:         '#12121F',
  bgSurface:      '#1C1C2E',
  bgInput:        '#1C1C2E',
  textPrimary:    '#FFFFFF',
  textSecondary:  '#8892A4',
  textMuted:      '#4A5568',
  accent:         '#6C63FF',
  accentLight:    '#8B83FF',
  success:        '#00D4AA',
  warning:        '#FFB547',
  danger:         '#FF4757',
  border:         '#1E2A3A',
  borderFocus:    '#6C63FF',
  btnPrimaryBg:   '#6C63FF',
  btnPrimaryEnd:  '#8B83FF',
  btnPrimaryText: '#FFFFFF',
  btnOutlineText: '#6C63FF',
  warningBg:      'rgba(255,181,71,0.08)',
  warningBorder:  'rgba(255,181,71,0.30)',
  warningText:    '#FFB547',
  tabBarBg:       '#0A0A14',
  tabBarActive:   '#6C63FF',
  tabBarInactive: '#4A5568',
  statusBarStyle: 'light-content',

  // Additional utility colors
  surfaceElevated: '#252540',
  primaryGlow:     'rgba(108, 99, 255, 0.3)',
  successLight:    'rgba(0, 212, 170, 0.15)',
  warningLightBg:  'rgba(255, 181, 71, 0.15)',
  errorLight:      'rgba(255, 71, 87, 0.15)',
  error:           '#FF4757',
  borderLight:     '#2A3A4E',

  // Gradient presets
  gradientPrimary: ['#6C63FF', '#8B83FF'],
  gradientAccent:  ['#6C63FF', '#00D4AA'],
  gradientDark:    ['#12121F', '#0A0A14'],
  gradientCard:    ['#12121F', '#1C1C2E'],
  gradientCTA:     ['#6C63FF', '#8B83FF'],

  // Vehicle colors
  car:       '#2563EB',
  bike:      '#16A34A',
  rickshaw:  '#D97706',
};

export const LIGHT_COLORS: ThemeColors = {
  bgPrimary:      '#F4F6FA',
  bgCard:         '#FFFFFF',
  bgSurface:      '#EEF0F7',
  bgInput:        '#FFFFFF',
  textPrimary:    '#0D0D1A',
  textSecondary:  '#4B5563',
  textMuted:      '#9CA3AF',
  accent:         '#4F46E5',
  accentLight:    '#6C63FF',
  success:        '#059669',
  warning:        '#D97706',
  danger:         '#DC2626',
  border:         '#E2E8F0',
  borderFocus:    '#4F46E5',
  btnPrimaryBg:   '#4F46E5',
  btnPrimaryEnd:  '#6C63FF',
  btnPrimaryText: '#FFFFFF',
  btnOutlineText: '#4F46E5',
  warningBg:      '#FFF8E7',
  warningBorder:  '#F59E0B',
  warningText:    '#92400E',
  tabBarBg:       '#FFFFFF',
  tabBarActive:   '#4F46E5',
  tabBarInactive: '#9CA3AF',
  statusBarStyle: 'dark-content',

  // Additional utility colors
  surfaceElevated: '#E2E8F0',
  primaryGlow:     'rgba(79, 70, 229, 0.15)',
  successLight:    'rgba(5, 150, 105, 0.12)',
  warningLightBg:  'rgba(217, 119, 6, 0.12)',
  errorLight:      'rgba(220, 38, 38, 0.12)',
  error:           '#DC2626',
  borderLight:     '#CBD5E1',

  // Gradient presets
  gradientPrimary: ['#4F46E5', '#6C63FF'],
  gradientAccent:  ['#4F46E5', '#059669'],
  gradientDark:    ['#F4F6FA', '#EEF0F7'],
  gradientCard:    ['#FFFFFF', '#F4F6FA'],
  gradientCTA:     ['#4F46E5', '#6C63FF'],

  // Vehicle colors
  car:       '#2563EB',
  bike:      '#16A34A',
  rickshaw:  '#D97706',
};

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'dark',
  colors: DARK_COLORS,
  isDark: true,
  setMode: () => {},
  toggleTheme: () => {},
});

const STORAGE_KEY = '@parkspace_theme_mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('dark');

  // Load saved preference on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setModeState(saved);
      }
    });
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(STORAGE_KEY, newMode);
  };

  const toggleTheme = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
  };

  // Resolve actual dark/light based on mode
  const isDark =
    mode === 'system' ? systemScheme === 'dark' : mode === 'dark';

  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <ThemeContext.Provider value={{ mode, colors, isDark, setMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
