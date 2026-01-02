import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Placeholder Component
 * Example reusable component structure
 */
const Placeholder = ({ title, message }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title || 'Component'}</Text>
      <Text style={styles.message}>{message || 'This is a placeholder'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#666',
  },
});

export default Placeholder;
