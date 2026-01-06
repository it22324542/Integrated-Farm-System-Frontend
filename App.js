import React from 'react';
import { StatusBar } from 'expo-status-bar';
import EggGradingScreen from './src/screens/EggGradingScreen';

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <EggGradingScreen />
    </>
  );
}