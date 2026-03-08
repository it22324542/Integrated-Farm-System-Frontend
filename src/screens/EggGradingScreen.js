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
  Dimensions,
} from 'react-native';
import { EggGradingAPI } from '../config/api';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

const EggGradingScreen = () => {
  const [formData, setFormData] = useState({
    height: '',
    diameter: '',
    weight: '',
    cageNo: '',
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.height || !formData.diameter || !formData.weight || !formData.cageNo) {
      Alert.alert('Required', 'Please complete all fields');
      return;
    }

    const h = parseFloat(formData.height);
    const d = parseFloat(formData.diameter);
    const w = parseFloat(formData.weight);
    const c = parseInt(formData.cageNo);

    if ([h, d, w, c].some((v) => isNaN(v) || v <= 0)) {
      Alert.alert('Invalid Input', 'All values must be positive numbers');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await EggGradingAPI.predictGrade(h, d, w, c);
      if (data.success) {
        setResult(data.data);
      } else {
        Alert.alert('Prediction Failed', data.error || 'Unknown error');
      }
    } catch (err) {
      Alert.alert('Connection Error', 'Cannot reach the grading service');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ height: '', diameter: '', weight: '', cageNo: '' });
    setResult(null);
  };

  const getGradeStyle = (grade) => {
    switch (grade?.toUpperCase()) {
      case 'A': return { bg: '#e6f4ea', border: '#2e7d32', text: '#1b5e20' };
      case 'B': return { bg: '#fff3e0', border: '#ef6c00', text: '#e65100' };
      case 'C': return { bg: '#ffebee', border: '#c62828', text: '#b71c1c' };
      default:  return { bg: '#f5f5f5', border: '#616161', text: '#424242' };
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>📏</Text>
            </View>
            <Text style={styles.title}>Egg Grading</Text>
            <Text style={styles.subtitle}>Enter measurements to classify quality grade</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {['height', 'diameter', 'weight'].map((field) => (
              <View key={field} style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                  <Text style={styles.unit}>
                    {field === 'weight' ? ' (g)' : ' (mm)'}
                  </Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={field === 'weight' ? '65.0' : '54.5'}
                  keyboardType="decimal-pad"
                  value={formData[field]}
                  onChangeText={(v) => handleChange(field, v)}
                  placeholderTextColor="#aaa"
                />
              </View>
            ))}

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Cage Number</Text>
              <View style={styles.pickerContainer}>
                <select
                  value={formData.cageNo}
                  onChange={(e) => handleChange('cageNo', e.target.value)}
                  style={styles.webSelect}
                >
                  <option value="">Select cage</option>
                  {[1,2,3,].map(n => (
                    <option key={n} value={n.toString()}>{n}</option>
                  ))}
                </select>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.btnText}>Predict Grade</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={resetForm}>
                <Text style={styles.btnTextOutline}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Result */}
          {result && (
            <View style={styles.resultSection}>
              <Text style={styles.resultTitle}>Grading Result</Text>

              <View style={styles.gradeBadgeContainer}>
                <View
                  style={[
                    styles.gradeBadge,
                    {
                      backgroundColor: getGradeStyle(result.grade).bg,
                      borderColor: getGradeStyle(result.grade).border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.gradeLetter,
                      { color: getGradeStyle(result.grade).text },
                    ]}
                  >
                    {result.grade}
                  </Text>
                  <Text style={styles.gradeDesc}>
                    {result.grade === 'A' ? 'Premium' : result.grade === 'B' ? 'Standard' : 'Utility'}
                  </Text>
                </View>
              </View>

              {result.probabilities && (
                <View style={styles.probSection}>
                  <Text style={styles.probTitle}>Confidence Levels</Text>
                  {Object.entries(result.probabilities).map(([grade, prob]) => {
                    const pct = (prob * 100).toFixed(1);
                    const style = getGradeStyle(grade);
                    return (
                      <View key={grade} style={styles.probRow}>
                        <Text style={styles.probLabel}>Grade {grade}</Text>
                        <View style={styles.barContainer}>
                          <View
                            style={[
                              styles.barFill,
                              {
                                width: `${pct}%`,
                                backgroundColor: style.border,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.probValue}>{pct}%</Text>
                      </View>
                    );
                  })}
                </View>
              )}

              <View style={styles.inputSummary}>
                <Text style={styles.summaryTitle}>Entered Values</Text>
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Height</Text>
                    <Text style={styles.summaryValue}>{result.measurements?.height ?? '-'}</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Diameter</Text>
                    <Text style={styles.summaryValue}>{result.measurements?.diameter ?? '-'}</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Weight</Text>
                    <Text style={styles.summaryValue}>{result.measurements?.weight ?? '-'}</Text>
                  </View>
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
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 16, paddingBottom: 60 },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  header: { alignItems: 'center', marginBottom: 32 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(33, 150, 243, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(33, 150, 243, 0.3)',
  },
  icon: { fontSize: 36 },
  title: { fontSize: 26, fontWeight: '800', color: '#0d1b2a', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center' },

  form: { marginBottom: 24 },

  inputWrapper: { marginBottom: 20 },
  inputLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  unit: { color: '#94a3b8', fontWeight: '500' },
  input: {
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#0f172a',
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fafafa',
  },
  webSelect: {
    width: '100%',
    padding: 14,
    fontSize: 16,
    color: '#0f172a',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
  },
  btn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: '#0ea5e9',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#64748b',
  },
  btnText: { color: 'white', fontSize: 15, fontWeight: '700' },
  btnTextOutline: { color: '#334155', fontSize: 15, fontWeight: '700' },

  resultSection: { marginTop: 32, paddingTop: 24, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  resultTitle: { fontSize: 17, fontWeight: '700', color: '#1e293b', marginBottom: 20, textAlign: 'center' },

  gradeBadgeContainer: { alignItems: 'center', marginBottom: 28 },
  gradeBadge: {
    width: 160,
    height: 160,
    borderRadius: 999,
    borderWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  gradeLetter: { fontSize: 78, fontWeight: '900', letterSpacing: -4 },
  gradeDesc: { fontSize: 14, fontWeight: '700', marginTop: 4, opacity: 0.9 },

  probSection: { marginBottom: 28 },
  probTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  probRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  probLabel: { width: 70, fontSize: 13, color: '#475569', fontWeight: '600' },
  barContainer: {
    flex: 1,
    height: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: { height: '100%' },
  probValue: { width: 50, fontSize: 13, fontWeight: '700', textAlign: 'right' },

  inputSummary: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  summaryTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12, color: '#334155' },
  summaryGrid: { gap: 10 },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  summaryLabel: { color: '#64748b', fontSize: 13 },
  summaryValue: { fontWeight: '700', color: '#0f172a' },
});

export default EggGradingScreen;