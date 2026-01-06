import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SoundUploadScreen from '../screens/SoundUploadScreen';
import ImageUploadScreen from '../screens/ImageUploadScreen';

/**
 * Root Navigation
 * Two-step poultry health detection workflow:
 * 1. Sound Upload - Analyze poultry sounds
 * 2. Image Upload - Detailed image analysis (only if sound is unhealthy)
 */

const Stack = createStackNavigator();

const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SoundUpload"
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* Step 1: Sound Analysis */}
        <Stack.Screen 
          name="SoundUpload" 
          component={SoundUploadScreen}
          options={{ 
            title: 'Poultry Health Detection',
            headerLeft: null, // Prevent back navigation on first screen
          }}
        />
        
        {/* Step 2: Image Analysis */}
        <Stack.Screen 
          name="ImageUpload" 
          component={ImageUploadScreen}
          options={{ 
            title: 'Image Analysis',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
