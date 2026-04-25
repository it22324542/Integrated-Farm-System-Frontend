/**
 * Application Theme
 * Colors, typography, spacing, and styling constants
 */

// Light Mode Colors
export const LIGHT_COLORS = {
  // Primary Colors - Green theme for farm/agriculture
  primary: '#10B981',        // Emerald Green
  primaryLight: '#6EE7B7',   // Light Green
  primaryDark: '#047857',    // Dark Green
  
  // Background Colors
  background: '#F3F4F6',     // Light Grey
  backgroundSecondary: '#E5E7EB',
  surface: '#FFFFFF',        // White
  surfaceSecondary: '#F9FAFB',
  card: '#FFFFFF',
  cardSecondary: '#F9FAFB',
  
  // Text Colors
  text: '#111827',           // Almost Black
  textSecondary: '#6B7280',  // Grey
  textTertiary: '#9CA3AF',
  textLight: '#FFFFFF',      // White
  
  // Status Colors
  success: '#10B981',        // Green
  error: '#EF4444',          // Red
  warning: '#F59E0B',        // Yellow
  info: '#3B82F6',           // Blue
  
  // Border & Divider
  border: '#E5E7EB',
  divider: '#D1D5DB',
  
  // Input
  inputBackground: '#F9FAFB',
  inputBorder: '#D1D5DB',
  inputText: '#111827',
  inputPlaceholder: '#9CA3AF',
  
  // Button
  buttonPrimary: '#10B981',
  buttonPrimaryHover: '#059669',
  buttonText: '#FFFFFF',
  
  // Sidebar/Drawer
  sidebarBackground: '#1F2937',
  sidebarText: '#F9FAFB',
  sidebarActive: '#10B981',
  
  // Header/Navigation
  headerBackground: '#1F2937',
  headerText: '#F9FAFB',
};

// Dark Mode Colors (matching screenshot)
export const DARK_COLORS = {
  // Primary Colors
  primary: '#10B981',        // Emerald Green
  primaryLight: '#6EE7B7',
  primaryDark: '#047857',
  
  // Background Colors
  background: '#0F172A',     // Dark Navy Blue
  backgroundSecondary: '#1E293B',
  surface: '#1E293B',        // Dark Blue Grey
  surfaceSecondary: '#334155',
  card: '#1E293B',
  cardSecondary: '#334155',
  
  // Text Colors
  text: '#F1F5F9',           // Light Grey
  textSecondary: '#94A3B8',  // Medium Grey
  textTertiary: '#64748B',
  textLight: '#FFFFFF',
  
  // Status Colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Border & Divider
  border: '#334155',
  divider: '#475569',
  
  // Input
  inputBackground: '#334155',
  inputBorder: '#475569',
  inputText: '#F1F5F9',
  inputPlaceholder: '#64748B',
  
  // Button
  buttonPrimary: '#10B981',
  buttonPrimaryHover: '#059669',
  buttonText: '#FFFFFF',
  
  // Sidebar/Drawer
  sidebarBackground: '#1E293B',
  sidebarText: '#F1F5F9',
  sidebarActive: '#10B981',
  
  // Header/Navigation
  headerBackground: '#1E293B',
  headerText: '#F1F5F9',
};

// Default to dark mode
export const COLORS = DARK_COLORS;

export const TYPOGRAPHY = {
  // Font Families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
  },
  
  // Font Sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 40,
  },
  
  // Font Weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
};

export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 9999,
};

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};

export const LAYOUT = {
  // Header Heights
  headerHeight: 60,
  tabBarHeight: 60,
  
  // Container Padding
  containerPadding: SPACING.base,
  
  // Screen Dimensions (will be set dynamically)
  screenWidth: 0,
  screenHeight: 0,
  
  // Max Widths
  maxContentWidth: 1200,
};

export const ANIMATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Export default theme object
export const THEME = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  layout: LAYOUT,
  animations: ANIMATIONS,
};

export default THEME;
