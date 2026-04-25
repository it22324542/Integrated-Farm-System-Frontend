import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import 'react-native-gesture-handler';

// Context Providers
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

/**
 * Web CSS Injection for Picker Dropdown Styling
 */
function WebPickerStyles() {
  const { isDarkMode, colors } = useTheme();
  
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Inject custom CSS for select elements
      const styleId = 'picker-dark-mode-styles';
      let styleElement = document.getElementById(styleId);
      
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      
      // Apply dark mode styles to select dropdowns
      styleElement.textContent = `
        select {
          background-color: ${colors.inputBackground} !important;
          color: ${colors.inputText} !important;
          border: 1px solid ${colors.inputBorder} !important;
        }
        
        select option {
          background-color: ${colors.inputBackground} !important;
          color: ${colors.text} !important;
          padding: 8px !important;
        }
        
        select option:hover,
        select option:focus,
        select option:checked {
          background-color: ${colors.primary} !important;
          color: white !important;
        }
      `;
    }
  }, [isDarkMode, colors]);
  
  return null;
}

/**
 * Main App Component
 * Root component with global providers and navigation
 */
function AppContent() {
  return (
    <>
      <WebPickerStyles />
      <AppNavigator />
      <StatusBar style="light" />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
