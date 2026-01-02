import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

/**
 * Root Navigation
 * Main navigation container - ready for screen integration
 * 
 * TODO: Add screens and navigation structure
 * Example:
 * import HomeScreen from '../screens/HomeScreen';
 * <Stack.Screen name="Home" component={HomeScreen} />
 */

const Stack = createStackNavigator();

const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Placeholder"
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
        {/* Placeholder screen - replace with actual screens */}
        <Stack.Screen 
          name="Placeholder" 
          component={PlaceholderScreen}
          options={{ title: 'Integrated Farm System' }}
        />
        
        {/* 
        Future screens will be added here:
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} />
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Temporary placeholder screen
const PlaceholderScreen = () => {
  const { View, Text, StyleSheet } = require('react-native');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Integrated Farm System</Text>
      <Text style={styles.subtitle}>Frontend Foundation Ready</Text>
      <Text style={styles.text}>
        This is a placeholder screen. Replace it with actual screens.
      </Text>
    </View>
  );
};

const styles = require('react-native').StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#2196F3',
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
});

export default RootNavigator;
