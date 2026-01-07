import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { EggQualityAPI } from '../config/api';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

const EggQualityScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to use this feature.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker. MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality:  0.8,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        setResult(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera permissions to use this feature.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        setResult(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const convertImageToBase64Web = async (uri) => {
    return new Promise((resolve, reject) => {
      fetch(uri)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
        .catch(reject);
    });
  };

  const convertImageToBase64Native = async (uri) => {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/jpeg;base64,${base64}`;
  };

  const handlePredict = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'Please select or capture an image first');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log('Reading image from:', imageUri);
      console.log('Platform:', Platform.OS);
      
      let base64Image;
      
      // Use different methods for web vs native
      if (Platform. OS === 'web') {
        console.log('Using web FileReader API');
        base64Image = await convertImageToBase64Web(imageUri);
      } else {
        console.log('Using expo-file-system');
        base64Image = await convertImageToBase64Native(imageUri);
      }
      
      console.log('Image converted to base64, length:', base64Image.length);
      console.log('Sending to API...');
      
      // Send to API
      const data = await EggQualityAPI.predictQualityBase64(base64Image);

      console.log('Response received:', data);

      if (data.success) {
        setResult(data.data);
      } else {
        Alert. alert('Error', data.error || 'Failed to predict quality');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not connect to server. Please check your connection.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImageUri(null);
    setResult(null);
  };

  const getQualityColor = (quality) => {
    return quality === 'Good' ? COLORS.secondary : COLORS.status.error;
  };

  const getQualityIcon = (quality) => {
    return quality === 'Good' ?  '✓' : '⚠';
  };

  const getQualityBgColor = (quality) => {
    return quality === 'Good' ? `${COLORS.secondary}10` : `${COLORS.status.error}10`;
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
              <Text style={styles.headerIcon}>📸</Text>
            </View>
            <Text style={styles.title}>Quality Detection</Text>
            <Text style={styles.subtitle}>Capture or upload an image for instant quality analysis</Text>
          </View>

          {/* Image Section */}
          <View style={styles.imageSection}>
            {imageUri ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.image} />
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={handleReset}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderIcon}>🖼️</Text>
                <Text style={styles.placeholderText}>No image selected</Text>
                <Text style={styles.placeholderHint}>Upload or capture a photo to begin</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.button, styles.actionButton]}
              onPress={pickImage}
            >
              <Text style={styles.buttonIcon}>🖼️</Text>
              <Text style={[styles.buttonText, styles.actionButtonText]}>
                Choose Photo
              </Text>
            </TouchableOpacity>

            {Platform.OS !== 'web' && (
              <TouchableOpacity 
                style={[styles.button, styles.actionButton]}
                onPress={takePhoto}
              >
                <Text style={styles.buttonIcon}>📷</Text>
                <Text style={[styles.buttonText, styles.actionButtonText]}>
                  Take Photo
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Predict Button */}
          {imageUri && (
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]}
              onPress={handlePredict}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.neutral.white} size="small" />
              ) : (
                <>
                  <Text style={styles.buttonIcon}>🔍</Text>
                  <Text style={styles.buttonText}>Analyze Quality</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Results */}
          {result && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultHeader}>Analysis Complete</Text>
              
              {/* Quality Display */}
              <View style={[styles.qualityDisplay, { 
                borderColor: getQualityColor(result.quality),
                backgroundColor: getQualityBgColor(result.quality)
              }]}>
                <Text style={styles.qualityIcon}>
                  {getQualityIcon(result.quality)}
                </Text>
                <Text style={[styles.qualityValue, { 
                  color: getQualityColor(result.quality) 
                }]}>
                  {result.status}
                </Text>
                <Text style={styles.confidenceText}>
                  Confidence: {result.confidence.toFixed(1)}%
                </Text>
              </View>

              {/* Description */}
              <View style={styles.descriptionBox}>
                <Text style={styles.boxTitle}>📋 Analysis</Text>
                <Text style={styles.boxContent}>{result.description}</Text>
              </View>

              {/* Recommendation */}
              <View style={[styles.recommendationBox, { borderLeftColor: COLORS.accent }]}>
                <Text style={styles.boxTitle}>💡 Recommendation</Text>
                <Text style={styles.boxContent}>{result.recommendation}</Text>
              </View>

              {/* Technical Details */}
              <View style={styles.technicalBox}>
                <Text style={styles.boxTitle}>🔬 Technical Details</Text>
                <View style={styles.technicalItem}>
                  <Text style={styles.technicalLabel}>Raw Score:</Text>
                  <Text style={styles.technicalValue}>
                    {result.raw_score.toFixed(4)}
                  </Text>
                </View>
                <View style={[styles.technicalItem, { borderBottomWidth: 0 }]}>
                  <Text style={styles.technicalLabel}>Classification:</Text>
                  <Text style={styles.technicalValue}>
                    {result.raw_score > 0.5 ? 'Class 1 (Good)' : 'Class 0 (Bad)'}
                  </Text>
                </View>
              </View>

              {/* Reset Button */}
              <TouchableOpacity 
                style={[styles.button, styles.resetButton]}
                onPress={handleReset}
              >
                <Text style={[styles.buttonText, styles.resetButtonText]}>
                  ↺ Analyze Another Egg
                </Text>
              </TouchableOpacity>
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
    marginBottom: 24,
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
  imageSection: {
    marginBottom: 18,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.neutral.lighter,
  },
  image: {
    width: '100%',
    height: 280,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  removeButtonText: {
    color: COLORS.neutral.white,
    fontSize: 20,
    fontWeight: '700',
  },
  placeholderContainer: {
    height: 280,
    backgroundColor: COLORS.neutral.lighter,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.neutral.medium,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  placeholderText: {
    color: COLORS.neutral.dark,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  placeholderHint: {
    color: COLORS.neutral.medium,
    fontSize: 13,
    fontWeight: '400',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  button: {
    padding: 13,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: COLORS.neutral.lighter,
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.neutral.medium,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  resetButton: {
    backgroundColor: COLORS.neutral.lighter,
    marginTop: 16,
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
  actionButtonText: {
    color: COLORS.neutral.darker,
  },
  resetButtonText: {
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
  qualityDisplay: {
    borderWidth: 2,
    borderRadius: 6,
    padding: 26,
    alignItems: 'center',
    marginBottom: 20,
  },
  qualityIcon: {
    fontSize: 42,
    marginBottom: 10,
  },
  qualityValue: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  confidenceText: {
    fontSize: 13,
    color: COLORS.neutral.dark,
    fontWeight: '600',
  },
  descriptionBox: {
    backgroundColor: COLORS.neutral.lighter,
    borderRadius: 6,
    padding: 14,
    marginBottom: 12,
  },
  recommendationBox: {
    backgroundColor: `${COLORS.secondary}08`,
    borderRadius: 6,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  technicalBox: {
    backgroundColor: COLORS.neutral.lighter,
    borderRadius: 6,
    padding: 14,
    marginBottom: 18,
  },
  boxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.neutral.darker,
    marginBottom: 10,
  },
  boxContent: {
    fontSize: 13,
    color: COLORS.neutral.dark,
    lineHeight: 19,
    fontWeight: '400',
  },
  technicalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.medium,
  },
  technicalLabel: {
    fontSize: 12,
    color: COLORS.neutral.dark,
    fontWeight: '700',
  },
  technicalValue: {
    fontSize: 12,
    color: COLORS.neutral.darker,
    fontWeight: '700',
  },
});

export default EggQualityScreen;