import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { EggGradingAPI } from '../config/api';

const { width } = Dimensions.get('window');

const EggGradingScreen = () => {
  const [formData, setFormData] = useState({
    height: '',
    diameter: '',
    weight: ''
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]:  value
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.height || !formData.diameter || ! formData.weight) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const height = parseFloat(formData.height);
    const diameter = parseFloat(formData.diameter);
    const weight = parseFloat(formData.weight);

    if (height <= 0 || diameter <= 0 || weight <= 0) {
      Alert.alert('Error', 'All measurements must be positive numbers');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await EggGradingAPI.predictGrade(height, diameter, weight);

      if (data.success) {
        setResult(data.data);
      } else {
        Alert.alert('Error', data.error || 'Failed to predict grade');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not connect to server. Please check your connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ height: '', diameter: '', weight:  '' });
    setResult(null);
  };

  const getGradeColor = (grade) => {
    switch(grade) {
      case 'A':  return '#4CAF50';
      case 'B': return '#2196F3';
      case 'C': return '#FF9800';
      default: return '#666';
    }
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Header */}
          <Text style={styles.title}>🥚 Egg Grading System</Text>
          <Text style={styles.subtitle}>Enter egg measurements to predict its grade</Text>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Height (mm)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 54. 5"
                keyboardType="decimal-pad"
                value={formData.height}
                onChangeText={(value) => handleChange('height', value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Diameter (mm)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 47. 5"
                keyboardType="decimal-pad"
                value={formData.diameter}
                onChangeText={(value) => handleChange('diameter', value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Weight (g)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 65. 6"
                keyboardType="decimal-pad"
                value={formData.weight}
                onChangeText={(value) => handleChange('weight', value)}
              />
            </View>

            {/* Buttons */}
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Predict Grade</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles. button, styles.secondaryButton]}
                onPress={handleReset}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Results */}
          {result && (
            <View style={styles. resultContainer}>
              <Text style={styles.resultHeader}>Prediction Result</Text>
              
              {/* Grade Display */}
              <View style={[styles.gradeDisplay, { borderColor: getGradeColor(result.grade) }]}>
                <Text style={styles.gradeLabel}>GRADE</Text>
                <Text style={[styles.gradeValue, { color: getGradeColor(result.grade) }]}>
                  {result.grade}
                </Text>
              </View>

              {/* Probabilities */}
              {result.probabilities && (
                <View style={styles.probabilities}>
                  <Text style={styles.sectionTitle}>Confidence Levels</Text>
                  {Object.entries(result.probabilities).map(([grade, prob]) => (
                    <View key={grade} style={styles. probabilityBar}>
                      <View style={styles.probabilityLabel}>
                        <Text style={styles.probabilityText}>Grade {grade}</Text>
                        <Text style={styles.probabilityText}>{(prob * 100).toFixed(2)}%</Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { 
                              width: `${prob * 100}%`,
                              backgroundColor: getGradeColor(grade)
                            }
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Measurements */}
              <View style={styles.measurements}>
                <Text style={styles.sectionTitle}>Input Measurements</Text>
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>Height:</Text>
                  <Text style={styles.measurementValue}>{result.measurements.height} mm</Text>
                </View>
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>Diameter:</Text>
                  <Text style={styles. measurementValue}>{result.measurements.diameter} mm</Text>
                </View>
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>Weight:</Text>
                  <Text style={styles.measurementValue}>{result.measurements.weight} g</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  card: {
    backgroundColor:  '#fff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity:  0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title:  {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  subtitle:  {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginBottom: 30,
  },
  form:  {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label:  {
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    fontSize: 15,
  },
  input:  {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttonGroup: {
    marginTop: 10,
    gap: 12,
  },
  button:  {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset:  { width: 0, height:  4 },
    shadowOpacity:  0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#333',
  },
  resultContainer: {
    marginTop: 30,
  },
  resultHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  gradeDisplay: {
    backgroundColor: '#f8f9fa',
    borderWidth: 3,
    borderRadius: 15,
    padding:  30,
    alignItems: 'center',
    marginBottom: 25,
  },
  gradeLabel: {
    fontSize: 12,
    color: '#666',
    letterSpacing: 2,
    marginBottom: 8,
  },
  gradeValue: {
    fontSize: 72,
    fontWeight: 'bold',
  },
  probabilities: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize:  16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  probabilityBar: {
    marginBottom: 15,
  },
  probabilityLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  probabilityText: {
    fontSize: 13,
    color: '#666',
  },
  progressBar:  {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  measurements: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 20,
  },
  measurementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  measurementLabel:  {
    fontWeight: '600',
    color: '#666',
    fontSize: 14,
  },
  measurementValue: {
    color: '#333',
    fontSize:  14,
  },
});

export default EggGradingScreen;