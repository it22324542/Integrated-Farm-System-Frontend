import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Placeholder Screen
 * Example screen structure - replace with actual screens
 */
const PlaceholderScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Placeholder Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
  },
});

export default PlaceholderScreen;
