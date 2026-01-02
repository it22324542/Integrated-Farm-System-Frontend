import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';

// Context Providers
import { AuthProvider } from './src/context/AuthContext';

// Navigation
import RootNavigator from './src/navigation/RootNavigator';

/**
 * Main App Component
 * Root component with global providers and navigation
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
