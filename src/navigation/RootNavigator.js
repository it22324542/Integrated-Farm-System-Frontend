import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SoundUploadScreen from '../screens/SoundUploadScreen';
import ImageUploadScreen from '../screens/ImageUploadScreen';
import DroppingUploadScreen from '../screens/DroppingUploadScreen';

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
          // Ensures every screen card fills the available height so that
          // ScrollView children can scroll properly on web and native.
          cardStyle: { flex: 1 },
        }}
      >
        {/* Step 1: Sound Analysis */}
        <Stack.Screen 
          name="SoundUpload" 
          component={SoundUploadScreen}
          options={{ 
            headerShown: false,
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

        {/* Step 3: Disease Detection By Using Dropping Images */}
        <Stack.Screen
          name="DroppingUpload"
          component={DroppingUploadScreen}
          options={{
            title: 'Disease Detection',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
