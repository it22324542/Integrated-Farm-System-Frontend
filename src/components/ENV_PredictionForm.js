/**
 * ENV Prediction Form Component
 * React Native form for inputting environmental factors
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';

const ENV_PredictionForm = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    temperature: '',
    humidity: '',
    ammonia: '',
    light_intensity: '',
    noise: '',
    amount_of_chicken: '',
    amount_of_feeding: ''
  });

  const formFields = [
    { 
      key: 'temperature', 
      label: 'Temperature (°C)', 
      placeholder: 'e.g., 22',
      keyboardType: 'decimal-pad',
      icon: '🌡️'
    },
    { 
      key: 'humidity', 
      label: 'Humidity (%)', 
      placeholder: 'e.g., 60',
      keyboardType: 'decimal-pad',
      icon: '💧'
    },
    { 
      key: 'ammonia', 
      label: 'Ammonia (ppm)', 
      placeholder: 'e.g., 8',
      keyboardType: 'decimal-pad',
      icon: '💨'
    },
    { 
      key: 'light_intensity', 
      label: 'Light Intensity (lux)', 
      placeholder: 'e.g., 35',
      keyboardType: 'decimal-pad',
      icon: '💡'
    },
    { 
      key: 'noise', 
      label: 'Noise Level (dB)', 
      placeholder: 'e.g., 55',
      keyboardType: 'decimal-pad',
      icon: '🔊'
    },
    { 
      key: 'amount_of_chicken', 
      label: 'Number of Chickens', 
      placeholder: 'e.g., 500',
      keyboardType: 'number-pad',
      icon: '🐔'
    },
    { 
      key: 'amount_of_feeding', 
      label: 'Feeding Amount (kg)', 
      placeholder: 'e.g., 180',
      keyboardType: 'decimal-pad',
      icon: '🌾'
    }
  ];

  const handleInputChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = () => {
    // Convert form data to API format
    const processedData = {};
    let hasData = false;

    Object.keys(formData).forEach(key => {
      if (formData[key] && formData[key].trim() !== '') {
        const numValue = parseFloat(formData[key]);
        if (!isNaN(numValue) && numValue >= 0) {
          processedData[key] = numValue;
          hasData = true;
        }
      }
    });

    if (!hasData) {
      Alert.alert(
        'No Data Entered',
        'Please enter at least one environmental factor to get a prediction.',
        [{ text: 'OK' }]
      );
      return;
    }

    onSubmit(processedData);
  };

  const handleClear = () => {
    setFormData({
      temperature: '',
      humidity: '',
      ammonia: '',
      light_intensity: '',
      noise: '',
      amount_of_chicken: '',
      amount_of_feeding: ''
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Environment Factors</Text>
        <Text style={styles.subtitle}>
          Enter available data (partial data OK)
        </Text>
      </View>

      {formFields.map((field) => (
        <View key={field.key} style={styles.fieldContainer}>
          <Text style={styles.label}>
            {field.icon} {field.label}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={field.placeholder}
            placeholderTextColor="#999"
            keyboardType={field.keyboardType}
            value={formData[field.key]}
            onChangeText={(value) => handleInputChange(field.key, value)}
            editable={!loading}
          />
        </View>
      ))}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={handleClear}
          disabled={loading}
        >
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Get Prediction</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          ℹ️ You don't need to fill all fields. The system works with partial data.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clearButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
  },
});

export default ENV_PredictionForm;
