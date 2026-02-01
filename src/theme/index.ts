import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

// İslami renk paleti
const islamicColors = {
  primary: '#1B5E20',      // Koyu yeşil (İslam'ın rengi)
  secondary: '#4CAF50',    // Açık yeşil
  tertiary: '#C5A028',     // Altın sarısı
  surface: '#FFFFFF',
  background: '#F5F5F5',
  error: '#B00020',
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onTertiary: '#000000',
  onSurface: '#1C1B1F',
  onBackground: '#1C1B1F',
  onError: '#FFFFFF',
  outline: '#79747E',
  elevation: {
    level0: 'transparent',
    level1: '#F7F7F7',
    level2: '#F2F2F2',
    level3: '#EDEDED',
    level4: '#EAEAEA',
    level5: '#E5E5E5',
  },
};

const islamicColorsDark = {
  primary: '#81C784',      // Açık yeşil (dark mode için)
  secondary: '#A5D6A7',    // Daha açık yeşil
  tertiary: '#FFD54F',     // Açık altın
  surface: '#1E1E1E',
  background: '#121212',
  error: '#CF6679',
  onPrimary: '#003300',
  onSecondary: '#003300',
  onTertiary: '#000000',
  onSurface: '#E6E6E6',
  onBackground: '#E6E6E6',
  onError: '#000000',
  outline: '#938F99',
  elevation: {
    level0: 'transparent',
    level1: '#232323',
    level2: '#282828',
    level3: '#2D2D2D',
    level4: '#2F2F2F',
    level5: '#333333',
  },
};

// Light Theme
export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: islamicColors.primary,
    onPrimary: islamicColors.onPrimary,
    primaryContainer: '#C8E6C9',
    onPrimaryContainer: '#002204',
    secondary: islamicColors.secondary,
    onSecondary: islamicColors.onSecondary,
    secondaryContainer: '#E8F5E9',
    onSecondaryContainer: '#003300',
    tertiary: islamicColors.tertiary,
    onTertiary: islamicColors.onTertiary,
    tertiaryContainer: '#FFF8E1',
    onTertiaryContainer: '#3E2723',
    error: islamicColors.error,
    onError: islamicColors.onError,
    errorContainer: '#F9DEDC',
    onErrorContainer: '#410E0B',
    background: islamicColors.background,
    onBackground: islamicColors.onBackground,
    surface: islamicColors.surface,
    onSurface: islamicColors.onSurface,
    surfaceVariant: '#E7E0EC',
    onSurfaceVariant: '#49454F',
    outline: islamicColors.outline,
    outlineVariant: '#CAC4D0',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#313033',
    inverseOnSurface: '#F4EFF4',
    inversePrimary: '#81C784',
    elevation: islamicColors.elevation,
    surfaceDisabled: 'rgba(28, 27, 31, 0.12)',
    onSurfaceDisabled: 'rgba(28, 27, 31, 0.38)',
    backdrop: 'rgba(50, 47, 55, 0.4)',
  },
};

// Dark Theme
export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: islamicColorsDark.primary,
    onPrimary: islamicColorsDark.onPrimary,
    primaryContainer: '#1B5E20',
    onPrimaryContainer: '#C8E6C9',
    secondary: islamicColorsDark.secondary,
    onSecondary: islamicColorsDark.onSecondary,
    secondaryContainer: '#2E7D32',
    onSecondaryContainer: '#E8F5E9',
    tertiary: islamicColorsDark.tertiary,
    onTertiary: islamicColorsDark.onTertiary,
    tertiaryContainer: '#5D4037',
    onTertiaryContainer: '#FFF8E1',
    error: islamicColorsDark.error,
    onError: islamicColorsDark.onError,
    errorContainer: '#8C1D18',
    onErrorContainer: '#F9DEDC',
    background: islamicColorsDark.background,
    onBackground: islamicColorsDark.onBackground,
    surface: islamicColorsDark.surface,
    onSurface: islamicColorsDark.onSurface,
    surfaceVariant: '#49454F',
    onSurfaceVariant: '#CAC4D0',
    outline: islamicColorsDark.outline,
    outlineVariant: '#49454F',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#E6E1E5',
    inverseOnSurface: '#313033',
    inversePrimary: '#1B5E20',
    elevation: islamicColorsDark.elevation,
    surfaceDisabled: 'rgba(230, 225, 229, 0.12)',
    onSurfaceDisabled: 'rgba(230, 225, 229, 0.38)',
    backdrop: 'rgba(50, 47, 55, 0.4)',
  },
};

// Özel stil sabitleri
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Namaz vakti kartları için renkler
export const prayerColors = {
  Fajr: '#1A237E',     // İmsak - Koyu mavi (gece)
  Sunrise: '#FF6F00',  // Güneş - Turuncu
  Dhuhr: '#FDD835',    // Öğle - Sarı
  Asr: '#FF8F00',      // İkindi - Koyu turuncu
  Maghrib: '#E65100',  // Akşam - Kızıl turuncu
  Isha: '#311B92',     // Yatsı - Mor
};

// Gradient renkleri (opsiyonel kullanım için)
export const gradients = {
  primary: ['#1B5E20', '#4CAF50'],
  gold: ['#C5A028', '#FFD54F'],
  night: ['#1A237E', '#311B92'],
  sunrise: ['#FF6F00', '#FDD835'],
  sunset: ['#E65100', '#FF8F00'],
};
