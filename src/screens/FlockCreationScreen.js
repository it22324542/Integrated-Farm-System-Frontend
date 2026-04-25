import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../config/apiConfig';
import { TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const FlockCreationScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const editMode = route?.params?.flock ? true : false;
  const existingFlock = route?.params?.flock;
  
  const [formData, setFormData] = useState({
    name: '',
    breed: 'Rhode Island Red',
    initialCount: '',
    ageInWeeks: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editMode && existingFlock) {
      setFormData({
        name: existingFlock.name || '',
        breed: existingFlock.breed || 'Rhode Island Red',
        initialCount: existingFlock.currentCount?.toString() || existingFlock.initialCount?.toString() || '',
        ageInWeeks: existingFlock.ageInWeeks?.toString() || '',
        notes: existingFlock.notes || ''
      });
    }
  }, [editMode, existingFlock]);

  const breeds = [
    'Rhode Island Red',
    'Leghorn',
    'Plymouth Rock',
    'Sussex',
    'Orpington',
    'Wyandotte',
    'Brahma',
    'Cochin',
    'Silkie',
    'Other'
  ];

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter flock name');
      return false;
    }
    if (!formData.initialCount || parseInt(formData.initialCount) < 1) {
      Alert.alert('Error', 'Please enter valid initial count (minimum 1)');
      return false;
    }
    if (!formData.ageInWeeks || parseInt(formData.ageInWeeks) < 0) {
      Alert.alert('Error', 'Please enter valid age in weeks');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const url = editMode 
        ? `${API_URL}/flocks/${existingFlock._id}` 
        : `${API_URL}/flocks`;
      
      const method = editMode ? 'put' : 'post';
      
      console.log(`${editMode ? 'Updating' : 'Creating'} flock:`, url);
      console.log('Data:', {
        name: formData.name.trim(),
        breed: formData.breed,
        initialCount: parseInt(formData.initialCount),
        currentCount: parseInt(formData.initialCount),
        ageInWeeks: parseInt(formData.ageInWeeks),
        notes: formData.notes.trim()
      });

      const response = await axios[method](url, {
        name: formData.name.trim(),
        breed: formData.breed,
        initialCount: parseInt(formData.initialCount),
        currentCount: parseInt(formData.initialCount),
        ageInWeeks: parseInt(formData.ageInWeeks),
        notes: formData.notes.trim()
      });

      console.log('Response:', response.data);

      // Check if response is successful
      if (response.data && response.data.success) {
        console.log(`✅ Flock ${editMode ? 'updated' : 'created'} successfully`);
        
        // Show brief success message
        Alert.alert('Success', `Flock ${editMode ? 'updated' : 'created'} successfully!`);
        
        // Navigate based on mode
        setTimeout(() => {
          if (editMode) {
            navigation.navigate('FlockDetail', {
              flockId: response.data.data._id,
              flockData: response.data.data
            });
          } else {
            // Navigate to Initial Feed Plan Screen for new flocks
            navigation.navigate('InitialFeedPlan', {
              flock: response.data.data
            });
          }
        }, 500);
      } else {
        // Handle unexpected response format
        console.warn('Unexpected response format:', response.data);
        Alert.alert('Warning', `Flock ${editMode ? 'updated' : 'created'} but response was unexpected.`);
      }
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} flock:`, error);
      console.error('Error details:', error.message);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = `Failed to ${editMode ? 'update' : 'create'} flock. `;
      
      if (error.message === 'Network Error' || error.code === 'ECONNREFUSED') {
        errorMessage += '\n\nCannot connect to server. Please check:\n1. Backend API is running on port 3000\n2. Your device is on the same network\n3. Firewall is not blocking connections';
      } else if (error.response) {
        errorMessage += error.response.data?.error || error.response.data?.message || 'Server error';
      } else {
        errorMessage += error.message;
      }
      
      Alert.alert('Connection Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Main Form Card */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="leaf" size={32} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>
              {editMode ? 'Edit Your Flock' : 'Create Your Flock'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {editMode ? 'Update flock information' : 'Step 1 of 3 — Establish your flock profile'}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.textTertiary }]}>PROGRESS</Text>
              <Text style={[styles.progressPercent, { color: colors.primary }]}>33%</Text>
            </View>
            <View style={[styles.progressBarContainer, { backgroundColor: colors.inputBackground }]}>
              <View style={[styles.progressBarFill, { backgroundColor: colors.primary }]} />
            </View>
          </View>

          {/* Form Grid */}
          <View style={styles.formGrid}>
            {/* Row 1 */}
            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  <Text style={styles.labelNumber}>1 </Text>
                  Flock Name <Text style={[styles.required, { color: colors.error }]}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.inputBackground, 
                    borderColor: colors.inputBorder,
                    color: colors.inputText 
                  }]}
                  placeholder="e.g., Free Range Elite"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={formData.name}
                  onChangeText={(value) => handleChange('name', value)}
                />
              </View>

              <View style={styles.formColumn}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  <Text style={styles.labelNumber}>2 </Text>
                  Breed <Text style={[styles.required, { color: colors.error }]}>*</Text>
                </Text>
                <View style={[styles.pickerContainer, { 
                  backgroundColor: colors.inputBackground, 
                  borderColor: colors.inputBorder 
                }]}>
                  <Picker
                    selectedValue={formData.breed}
                    onValueChange={(value) => handleChange('breed', value)}
                    style={[styles.picker, { 
                      color: colors.inputText,
                      backgroundColor: colors.inputBackground
                    }]}
                    dropdownIconColor={colors.inputText}
                    itemStyle={{ 
                      color: colors.text,
                      backgroundColor: colors.inputBackground
                    }}
                  >
                    {breeds.map((breed) => (
                      <Picker.Item 
                        key={breed} 
                        label={breed} 
                        value={breed}
                        color={colors.text}
                        style={{ backgroundColor: colors.inputBackground }}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            {/* Row 2 */}
            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  <Text style={styles.labelNumber}>3 </Text>
                  Initial Count <Text style={[styles.required, { color: colors.error }]}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.inputBackground, 
                    borderColor: colors.inputBorder,
                    color: colors.inputText 
                  }]}
                  placeholder="Number of chickens"
                  placeholderTextColor={colors.inputPlaceholder}
                  keyboardType="numeric"
                  value={formData.initialCount}
                  onChangeText={(value) => handleChange('initialCount', value)}
                />
              </View>

              <View style={styles.formColumn}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  <Text style={styles.labelNumber}>4 </Text>
                  Age (Weeks) <Text style={[styles.required, { color: colors.error }]}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.inputBackground, 
                    borderColor: colors.inputBorder,
                    color: colors.inputText 
                  }]}
                  placeholder="Current age in weeks"
                  placeholderTextColor={colors.inputPlaceholder}
                  keyboardType="numeric"
                  value={formData.ageInWeeks}
                  onChangeText={(value) => handleChange('ageInWeeks', value)}
                />
              </View>
            </View>

            {/* Notes - Full Width */}
            <View style={styles.formFullRow}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
                {' '}Additional Notes <Text style={{ color: colors.textTertiary }}>(Optional)</Text>
              </Text>
              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: colors.inputBackground, 
                  borderColor: colors.inputBorder,
                  color: colors.inputText 
                }]}
                placeholder="Share any special details about your flock..."
                placeholderTextColor={colors.inputPlaceholder}
                multiline
                numberOfLines={4}
                value={formData.notes}
                onChangeText={(value) => handleChange('notes', value)}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.buttonPrimary }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator color={colors.buttonText} size="small" />
                <Text style={[styles.buttonText, { color: colors.buttonText }]}>
                  {editMode ? 'Updating...' : 'Creating...'}
                </Text>
              </View>
            ) : (
              <Text style={[styles.buttonText, { color: colors.buttonText }]}>
                {editMode ? 'Save Changes' : 'Create Flock & Continue'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Feature Cards */}
        <View style={styles.featureCards}>
          <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
            <View style={[styles.featureNumber, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.featureNumberText, { color: colors.primary }]}>1</Text>
            </View>
            <Text style={[styles.featureTitle, { color: colors.text }]}>Predict Growth</Text>
            <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
              AI-powered predictions for your flock development
            </Text>
          </View>

          <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
            <View style={[styles.featureNumber, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.featureNumberText, { color: colors.primary }]}>2</Text>
            </View>
            <Text style={[styles.featureTitle, { color: colors.text }]}>Feed Planning</Text>
            <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
              Upload and analyze feed plan images
            </Text>
          </View>

          <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
            <View style={[styles.featureNumber, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.featureNumberText, { color: colors.primary }]}>3</Text>
            </View>
            <Text style={[styles.featureTitle, { color: colors.text }]}>Health Tracking</Text>
            <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
              Monitor and optimize flock wellness
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    padding: 32,
    marginBottom: 24,
    ...SHADOWS.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
  },
  progressSection: {
    marginBottom: 32,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    letterSpacing: 1,
  },
  progressPercent: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '33%',
    height: '100%',
    borderRadius: 4,
  },
  formGrid: {
    marginBottom: 24,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 16,
  },
  formColumn: {
    flex: 1,
  },
  formFullRow: {
    marginTop: 4,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginBottom: 8,
  },
  labelNumber: {
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  required: {
    fontSize: TYPOGRAPHY.fontSize.base,
  },
  input: {
    borderRadius: BORDER_RADIUS.md,
    padding: 14,
    fontSize: TYPOGRAPHY.fontSize.base,
    borderWidth: 1,
  },
  pickerContainer: {
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  button: {
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
  featureCards: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  featureCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    padding: 20,
    ...SHADOWS.md,
  },
  featureNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureNumberText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: 20,
  },
});

export default FlockCreationScreen;

