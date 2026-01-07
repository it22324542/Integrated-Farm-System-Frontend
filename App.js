import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './src/constants/theme';

import HomeScreen from './src/screens/HomeScreen';
import EggGradingScreen from './src/screens/EggGradingScreen';
import EggQualityScreen from './src/screens/EggQualityScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.accent,
            elevation: 2,
            shadowOpacity: 0.08,
          },
          headerTintColor: COLORS.neutral.white,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            letterSpacing: 0.5,
          },
          headerBackTitleVisible: false,
          cardStyle: {
            backgroundColor: COLORS.neutral.white,
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Integrated Farm System' }}
        />
        <Stack.Screen 
          name="EggGrading" 
          component={EggGradingScreen}
          options={{ title: 'Egg Grading Analysis' }}
        />
        <Stack.Screen 
          name="EggQuality" 
          component={EggQualityScreen}
          options={{ title: 'Egg Quality Detection' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}