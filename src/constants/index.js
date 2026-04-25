/**
 * Application Constants
 * Centralized configuration values and constants
 */

// Export theme
export * from './theme';

export const APP_CONSTANTS = {
  APP_NAME: 'Integrated Farm System',
  VERSION: '1.0.0',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  SETTINGS: 'appSettings',
  LANGUAGE: 'selectedLanguage',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
  },
  DISEASE: {
    PREDICT: '/disease/predict',
    HISTORY: '/disease/history',
    DETAILS: '/disease/details',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile/update',
  },
};

export const IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB in bytes
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  QUALITY: 0.8,
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1080,
};

export const COLORS = {
  primary: '#4CAF50',
  secondary: '#2196F3',
  accent: '#FF9800',
  error: '#F44336',
  warning: '#FFC107',
  success: '#4CAF50',
  info: '#2196F3',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0',
  disabled: '#BDBDBD',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const SCREEN_NAMES = {
  // Auth Screens
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  
  // Main Screens
  HOME: 'Home',
  CAMERA: 'Camera',
  HISTORY: 'History',
  PROFILE: 'Profile',
  
  // Feature Screens
  DISEASE_DETECTION: 'DiseaseDetection',
  RESULTS: 'Results',
  SETTINGS: 'Settings',
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Unauthorized. Please login again.',
  INVALID_CREDENTIALS: 'Invalid credentials.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
};
