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
import { EggGradingAPI } from '../config/api';
import { COLORS } from '../constants/theme';

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
      case 'A':  return COLORS.secondary;
      case 'B': return COLORS.primary;
      case 'C': return COLORS.accent;
      default: return COLORS.neutral.dark;
    }
  };

  const getGradeLabel = (grade) => {
    switch(grade) {
      case 'A': return 'Premium Grade';
      case 'B': return 'Standard Grade';
      case 'C': return 'Good Grade';
      default: return 'Classified';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.iconContainer}>
              <Text style={styles.headerIcon}>📏</Text>
            </View>
            <Text style={styles.title}>Egg Grading Analysis</Text>
            <Text style={styles.subtitle}>Enter precise measurements for accurate grade prediction</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Height</Text>
                <Text style={styles.unit}>mm</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="54.5"
                keyboardType="decimal-pad"
                placeholderTextColor={COLORS.neutral.medium}
                value={formData.height}
                onChangeText={(value) => handleChange('height', value)}
              />
              <Text style={styles.hint}>Physical height of the egg</Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Diameter</Text>
                <Text style={styles.unit}>mm</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="47.5"
                keyboardType="decimal-pad"
                placeholderTextColor={COLORS.neutral.medium}
                value={formData.diameter}
                onChangeText={(value) => handleChange('diameter', value)}
              />
              <Text style={styles.hint}>Width of the egg</Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Weight</Text>
                <Text style={styles.unit}>g</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="65.6"
                keyboardType="decimal-pad"
                placeholderTextColor={COLORS.neutral.medium}
                value={formData.weight}
                onChangeText={(value) => handleChange('weight', value)}
              />
              <Text style={styles.hint}>Mass of the egg</Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.neutral.white} size="small" />
                ) : (
                  <>
                    <Text style={styles.buttonIcon}>✓</Text>
                    <Text style={styles.buttonText}>Predict Grade</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]}
                onPress={handleReset}
              >
                <Text style={styles.buttonIcon}>↺</Text>
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Results */}
          {result && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultHeader}>Analysis Result</Text>
              
              {/* Grade Display */}
              <View style={[styles.gradeDisplay, { borderColor: getGradeColor(result.grade), backgroundColor: `${getGradeColor(result.grade)}10` }]}>
                <Text style={[styles.gradeValue, { color: getGradeColor(result.grade) }]}>
                  {result.grade}
                </Text>
                <Text style={styles.gradeLabel}>{getGradeLabel(result.grade)}</Text>
              </View>

              {/* Probabilities */}
              {result.probabilities && (
                <View style={styles.probabilities}>
                  <Text style={styles.sectionTitle}>Confidence Distribution</Text>
                  {Object.entries(result.probabilities).map(([grade, prob]) => (
                    <View key={grade} style={styles.probabilityBar}>
                      <View style={styles.probabilityHeader}>
                        <Text style={styles.probabilityGrade}>Grade {grade}</Text>
                        <Text style={styles.probabilityPercent}>{(prob * 100).toFixed(1)}%</Text>
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
                  <Text style={styles.measurementLabel}>Height</Text>
                  <Text style={styles.measurementValue}>{result.measurements.height} mm</Text>
                </View>
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>Diameter</Text>
                  <Text style={styles.measurementValue}>{result.measurements.diameter} mm</Text>
                </View>
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>Weight</Text>
                  <Text style={styles.measurementValue}>{result.measurements.weight} g</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.light,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 28,
    paddingTop: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 6,
    backgroundColor: `${COLORS.primary}12`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  headerIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    color: COLORS.neutral.darker,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: COLORS.neutral.dark,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontWeight: '700',
    color: COLORS.neutral.darker,
    fontSize: 13,
  },
  unit: {
    fontSize: 11,
    color: COLORS.neutral.medium,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.neutral.lighter,
    borderRadius: 6,
    padding: 11,
    fontSize: 15,
    backgroundColor: COLORS.neutral.white,
    color: COLORS.neutral.darker,
    marginBottom: 6,
    fontWeight: '500',
  },
  hint: {
    fontSize: 11,
    color: COLORS.neutral.medium,
    fontWeight: '400',
  },
  buttonGroup: {
    marginTop: 22,
    gap: 12,
  },
  button: {
    padding: 13,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: COLORS.neutral.lighter,
    borderWidth: 1,
    borderColor: COLORS.neutral.medium,
  },
  buttonIcon: {
    fontSize: 16,
    fontWeight: '700',
  },
  buttonText: {
    color: COLORS.neutral.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  secondaryButtonText: {
    color: COLORS.neutral.darker,
  },
  resultContainer: {
    marginTop: 28,
    paddingTop: 22,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral.lighter,
  },
  resultHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.neutral.darker,
    textAlign: 'center',
    marginBottom: 18,
  },
  gradeDisplay: {
    borderWidth: 2,
    borderRadius: 6,
    padding: 26,
    alignItems: 'center',
    marginBottom: 22,
  },
  gradeValue: {
    fontSize: 56,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -2,
  },
  gradeLabel: {
    fontSize: 13,
    color: COLORS.neutral.dark,
    fontWeight: '700',
  },
  probabilities: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.neutral.darker,
    marginBottom: 12,
  },
  probabilityBar: {
    marginBottom: 12,
  },
  probabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  probabilityGrade: {
    fontSize: 12,
    color: COLORS.neutral.darker,
    fontWeight: '700',
  },
  probabilityPercent: {
    fontSize: 12,
    color: COLORS.neutral.dark,
    fontWeight: '700',
  },
  progressBar: {
    height: 7,
    backgroundColor: COLORS.neutral.lighter,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  measurements: {
    backgroundColor: COLORS.neutral.lighter,
    borderRadius: 6,
    padding: 14,
  },
  measurementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.medium,
  },
  measurementLabel: {
    fontWeight: '700',
    color: COLORS.neutral.dark,
    fontSize: 12,
  },
  measurementValue: {
    color: COLORS.neutral.darker,
    fontSize: 12,
    fontWeight: '700',
  },
});

export default EggGradingScreen;