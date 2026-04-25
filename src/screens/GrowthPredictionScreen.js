import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Animated,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_URL } from '../config/apiConfig';
import { useTheme } from '../context/ThemeContext';
import { TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const GrowthPredictionScreen = ({ route, navigation }) => {
  const { flock } = route.params || {};
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Safety check - if flock is missing, go back
  useEffect(() => {
    if (!flock || !flock._id) {
      Alert.alert('Error', 'Flock data not found. Please try again.');
      navigation.goBack();
    }
  }, [flock, navigation]);

  const [formData, setFormData] = useState({
    actualWeight: '',
    feedType: 'Starter Feed',
    weekNumber: flock ? Math.floor(flock.ageInWeeks || 0) : 0
  });
  const [feedImage, setFeedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const resultFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (prediction) {
      Animated.timing(resultFade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [prediction]);

  const feedTypes = ['Starter Feed', 'Grower Feed', 'Layer Feed', 'Mixed Feed'];

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Updated to use array format instead of deprecated MediaTypeOptions
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFeedImage(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera permissions to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFeedImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('flockId', flock._id);
      formDataToSend.append('feedType', formData.feedType);
      formDataToSend.append('weekNumber', formData.weekNumber);

      if (formData.actualWeight) {
        formDataToSend.append('actualWeight', parseFloat(formData.actualWeight));
      }

      if (feedImage) {
        console.log('📷 Preparing image upload:');
        console.log('   Full feedImage object:', JSON.stringify(feedImage, null, 2));
        
        try {
          // Get file extension
          const uriParts = feedImage.uri.split('.');
          const fileType = uriParts[uriParts.length - 1].toLowerCase();
          const fileName = feedImage.fileName || `feed-plate-${Date.now()}.${fileType || 'jpg'}`;
          
          // For React Native Web, we need to handle file upload differently
          // The URI from ImagePicker in web mode is a blob URL
          if (feedImage.uri.startsWith('blob:') || feedImage.uri.startsWith('http')) {
            console.log('   🌐 Web mode detected - converting blob to File object');
            
            // Fetch the blob from the URI
            const imageBlob = await fetch(feedImage.uri).then(r => r.blob());
            console.log('   Blob size:', imageBlob.size, 'Type:', imageBlob.type);
            
            // Create a proper File object from the blob
            // This is important for React Native Web compatibility
            const imageFile = new File([imageBlob], fileName, {
              type: imageBlob.type || `image/${fileType}`,
              lastModified: Date.now()
            });
            
            console.log('   File object created:', {
              name: imageFile.name,
              size: imageFile.size,
              type: imageFile.type
            });
            
            // Append the File object to FormData
            formDataToSend.append('feedImage', imageFile, fileName);
            console.log('   ✅ File object appended to FormData');
          } else {
            // Mobile mode - use the standard format
            console.log('   📱 Mobile mode detected');
            const imageFile = {
              uri: feedImage.uri,
              type: feedImage.type || `image/${fileType}`,
              name: fileName,
            };
            console.log('   Image file object:', JSON.stringify(imageFile, null, 2));
            formDataToSend.append('feedImage', imageFile);
            console.log('   ✅ Image file appended to FormData');
          }
        } catch (imgError) {
          console.error('❌ Error preparing image:', imgError);
          Alert.alert('Error', 'Failed to prepare image for upload: ' + imgError.message);
          setLoading(false);
          return;
        }
      } else {
        console.log('⚠️ No image selected - feedImage is:', feedImage);
      }

      console.log('🚀 Sending prediction request to backend with FETCH API...');
      
      // Use fetch API instead of axios for better React Native Web compatibility
      const fetchResponse = await fetch(
        `${API_URL}/predictions/growth`,
        {
          method: 'POST',
          body: formDataToSend,
          // Don't set Content-Type header - let browser/fetch set it automatically with boundary
        }
      );

      console.log('📥 Fetch response status:', fetchResponse.status);
      const responseData = await fetchResponse.json();
      console.log('✅ Response data:', JSON.stringify(responseData, null, 2));

      if (responseData.success) {
        setPrediction(responseData.data);
        
        // Extract feed consumption percentage from response
        const feedPercent = responseData.data.feedAnalysis?.feedConsumedPercentage;
        const feedConfidence = responseData.data.feedAnalysis?.feedConfidence;
        
        console.log('📊 Feed Consumption:', feedPercent + '%');
        console.log('🎯 Model Confidence:', feedConfidence?.toFixed(1) + '%');
        
        // Check confidence level and warn user if low
        if (feedConfidence && feedConfidence < 60) {
          Alert.alert(
            '⚠️ Low Confidence Warning', 
            `Feed Consumption: ${feedPercent}%\nConfidence: ${feedConfidence?.toFixed(1)}%\n\n⚠️ The model is not confident about this prediction.\n\nThe result may be inaccurate. Consider:\n• Taking a clearer photo\n• Better lighting\n• Different camera angle\n\nWould you like to retake the photo?`,
            [
              { text: 'Retake Photo', onPress: () => pickImage() },
              { text: 'Accept Result', style: 'cancel' }
            ]
          );
        } else {
          Alert.alert(
            'Success', 
            feedPercent !== null 
              ? `Growth prediction completed!\n\nFeed Consumption: ${feedPercent}%\nConfidence: ${feedConfidence?.toFixed(1)}%\n\n${feedConfidence >= 80 ? '✅ High confidence result!' : '✓ Acceptable confidence'}`
              : 'Growth prediction completed!'
          );
        }
      } else {
        throw new Error(responseData.error || 'Prediction failed');
      }
    } catch (error) {
      console.error('❌ Prediction error:', error);
      console.error('   Error message:', error.message);
      Alert.alert(
        'Error',
        error.message || 'Failed to generate prediction. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const navigateToFeedPlan = () => {
    navigation.navigate('FeedOptimization', {
      flock: flock,
      prediction: prediction
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{maxWidth: 800, width: '100%', alignSelf: 'center', padding: 20, paddingBottom: 100}}>
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.headerGradient}>
            <Text style={styles.title}>📊 Growth Prediction</Text>
            <Text style={styles.subtitle}>Step 2 of 3 • Analyze chicken growth</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '66%' }]} />
            </View>
          </View>
        </Animated.View>

        {/* Flock Info Card */}
        <Animated.View 
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ scale: cardScale }]
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🐔 Flock Details</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{flock?.growthStage || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{flock?.name || 'N/A'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Breed</Text>
              <Text style={styles.infoValue}>{flock?.breed || 'N/A'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{flock?.ageInWeeks || 0}w / {flock?.ageInDays || 0}d</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Count</Text>
              <Text style={styles.infoValue}>{flock?.currentCount || 0}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Input Form */}
        <Animated.View 
          style={[
            styles.form,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          {/* Actual Weight (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>⚖️ Actual Weight (grams) - Optional</Text>
            <TextInput
              style={[
                styles.input,
                focusedField === 'weight' && styles.inputFocused
              ]}
              placeholder="Leave empty to predict only"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={formData.actualWeight}
              onChangeText={(value) => handleChange('actualWeight', value)}
              onFocus={() => setFocusedField('weight')}
              onBlur={() => setFocusedField(null)}
            />
            <Text style={styles.hint}>💡 Enter weight if you have measured it</Text>
          </View>

          {/* Feed Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>🌾 Feed Type *</Text>
            <View style={[
              styles.pickerContainer,
              focusedField === 'feed' && styles.inputFocused
            ]}>
              <Picker
                selectedValue={formData.feedType}
                onValueChange={(value) => handleChange('feedType', value)}
                style={[styles.picker, { 
                  color: colors.text,
                  backgroundColor: colors.inputBackground 
                }]}
                dropdownIconColor={colors.text}
                itemStyle={{ 
                  color: colors.text,
                  backgroundColor: colors.inputBackground 
                }}
                onFocus={() => setFocusedField('feed')}
                onBlur={() => setFocusedField(null)}
              >
                {feedTypes.map((type) => (
                  <Picker.Item 
                    key={type} 
                    label={type} 
                    value={type}
                    color={colors.text}
                    style={{ backgroundColor: colors.inputBackground }}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Feed Plate Image */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>📸 Feed Plate Image (Optional)</Text>
            <Text style={styles.hint}>💡 Upload photo to detect feed consumption</Text>
            
            <View style={styles.imageButtons}>
              <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                <Text style={styles.imageButtonIcon}>📷</Text>
                <Text style={styles.imageButtonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Text style={styles.imageButtonIcon}>🖼️</Text>
                <Text style={styles.imageButtonText}>Choose Image</Text>
              </TouchableOpacity>
            </View>

            {feedImage && (
              <Animated.View 
                style={[
                  styles.imagePreview,
                  {
                    opacity: fadeAnim,
                  }
                ]}
              >
                <Image source={{ uri: feedImage.uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setFeedImage(null)}
                >
                  <Text style={styles.removeImageText}>✕ Remove Image</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>

          {/* Submit Button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.loadingText}>Analyzing...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Analyze Growth</Text>
                  <Text style={styles.buttonIcon}>→</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Prediction Results */}
        {prediction && (
          <Animated.View 
            style={[
              styles.resultsSection,
              {
                opacity: resultFade,
                transform: [{
                  translateY: resultFade.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0]
                  })
                }]
              }
            ]}
          >
            <Text style={styles.resultsTitle}>🎯 Prediction Results</Text>

            {/* Weight Prediction */}
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultIcon}>📈</Text>
                <Text style={styles.resultLabel}>Weight Analysis</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultMetric}>Predicted Weight:</Text>
                <Text style={styles.resultValue}>{prediction.prediction.predictedWeight}g</Text>
              </View>
              {prediction.prediction.actualWeight && (
                <>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultMetric}>Actual Weight:</Text>
                    <Text style={styles.resultValue}>{prediction.prediction.actualWeight}g</Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultMetric}>Difference:</Text>
                    <Text style={[
                      styles.resultValue,
                      prediction.prediction.weightDifference >= 0 ? styles.positive : styles.negative
                    ]}>
                      {prediction.prediction.weightDifference > 0 ? '+' : ''}
                      {prediction.prediction.weightDifference}g
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    prediction.prediction.growthStatus === 'On Target' && styles.statusOn,
                    prediction.prediction.growthStatus === 'Above Target' && styles.statusAbove,
                    prediction.prediction.growthStatus === 'Below Target' && styles.statusBelow,
                  ]}>
                    <Text style={styles.statusText}>{prediction.prediction.growthStatus}</Text>
                  </View>
                </>
              )}
            </View>

            {/* Feed Analysis */}
            {prediction.feedAnalysis && (
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultIcon}>🍽️</Text>
                  <Text style={styles.resultLabel}>Feed Consumption</Text>
                </View>
                <View style={styles.percentageCircle}>
                  <Text style={styles.percentageValue}>
                    {prediction.feedAnalysis.feedConsumedPercentage}%
                  </Text>
                  <Text style={styles.percentageLabel}>Consumed</Text>
                </View>
                {prediction.feedAnalysis.imageUrl && (
                  <Image
                    source={{ uri: `${API_URL}${prediction.feedAnalysis.imageUrl}` }}
                    style={styles.resultImage}
                    resizeMode="cover"
                  />
                )}
              </View>
            )}

            {/* Recommendation */}
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationIcon}>💡</Text>
              <Text style={styles.recommendationTitle}>Expert Recommendation</Text>
              <Text style={styles.recommendationText}>{prediction.recommendation}</Text>
            </View>

            {/* Next Step Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={navigateToFeedPlan}
                activeOpacity={0.8}
              >
                <Text style={styles.nextButtonText}>Generate Feed Plan</Text>
                <Text style={styles.nextButtonIcon}>→</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        )}
      </View>
    </ScrollView>
  );
};

const createStyles = (colors) => StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '75%',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerGradient: {
    padding: 28,
    paddingTop: 50,
    paddingBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.95,
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  card: {
    margin: 12,
    marginBottom: 12,
    padding: 18,
    backgroundColor: colors.card,
    borderRadius: 20,
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.3,
  },
  badge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  infoItem: {
    width: '50%',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '700',
  },
  form: {
    padding: 20,
    paddingTop: 8,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    fontSize: 18,
    color: colors.text,
    ...SHADOWS.sm,
  },
  inputFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  hint: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 8,
    fontWeight: '500',
  },
  pickerContainer: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  picker: {
    height: 54,
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  imageButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderStyle: 'dashed',
    ...SHADOWS.sm,
  },
  imageButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  imageButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  imagePreview: {
    marginTop: 16,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    ...SHADOWS.md,
  },
  image: {
    width: 280,
    height: 280,
    borderRadius: 12,
  },
  removeImageButton: {
    marginTop: 12,
    padding: 10,
  },
  removeImageText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '700',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...SHADOWS.lg,
    minHeight: 60,
  },
  buttonDisabled: {
    backgroundColor: colors.textSecondary,
    shadowOpacity: 0.2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  buttonIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  resultsSection: {
    padding: 20,
    paddingTop: 8,
  },
  resultsTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  resultLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultMetric: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  positive: {
    color: colors.primary,
  },
  negative: {
    color: colors.error,
  },
  statusBadge: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusOn: {
    backgroundColor: colors.primary,
  },
  statusAbove: {
    backgroundColor: '#3B82F6',
  },
  statusBelow: {
    backgroundColor: '#F59E0B',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  percentageCircle: {
    alignItems: 'center',
    marginVertical: 20,
  },
  percentageValue: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.primary,
  },
  percentageLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  resultImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginTop: 16,
  },
  recommendationCard: {
    backgroundColor: colors.primary + '20',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  recommendationIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  recommendationText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  nextButtonIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default GrowthPredictionScreen;
