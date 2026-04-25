import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_URL } from '../config/api';

const DailyAnalysisScreen = ({ route, navigation }) => {
  const { flockId, flockDetails } = route.params;
  
  const [imageUri, setImageUri] = useState(null);
  const [actualWeight, setActualWeight] = useState('');
  const [feedType, setFeedType] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Request camera permissions
  const requestPermissions = async () => {
    try {
      console.log('🔐 Requesting permissions...');
      
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      console.log('Camera permission:', cameraPermission.status);
      
      const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Media library permission:', mediaPermission.status);
      
      if (cameraPermission.status !== 'granted' || mediaPermission.status !== 'granted') {
        console.log('❌ Permissions denied');
        Alert.alert(
          'Permissions Required', 
          'Camera and gallery permissions are needed to upload images. Please enable them in Settings.'
        );
        return false;
      }
      
      console.log('✅ All permissions granted');
      return true;
    } catch (error) {
      console.error('❌ Permission error:', error);
      Alert.alert('Error', `Permission error: ${error.message}`);
      return false;
    }
  };

  // Open camera directly
  const openCamera = async () => {
    console.log('📸 openCamera function called');
    
    try {
      console.log('📸 Launching camera...');
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log('📸 Camera result:', JSON.stringify(result, null, 2));

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        console.log('✅ Image captured successfully:', uri);
        setImageUri(uri);
        Alert.alert('Success', 'Image uploaded successfully!');
      } else {
        console.log('❌ Camera cancelled or no image selected');
      }
    } catch (error) {
      console.error('❌ Camera error:', error);
      Alert.alert('Error', `Camera failed: ${error.message}`);
    }
  };

  // Open gallery directly
  const openGallery = async () => {
    console.log('🖼️ openGallery function called');
    
    try {
      console.log('🖼️ Launching gallery...');
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log('🖼️ Gallery result:', JSON.stringify(result, null, 2));

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        console.log('✅ Image selected successfully:', uri);
        setImageUri(uri);
        Alert.alert('Success', 'Image uploaded successfully!');
      } else {
        console.log('❌ Gallery cancelled or no image selected');
      }
    } catch (error) {
      console.error('❌ Gallery error:', error);
      Alert.alert('Error', `Gallery failed: ${error.message}`);
    }
  };

  // Handle image selection with choice
  const handleImageUpload = async () => {
    console.log('📷 ===== Image upload button clicked =====');
    
    try {
      // Check and request permissions first
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        console.log('❌ Permissions check failed, aborting');
        return;
      }

      console.log('✅ Permissions granted, showing options');

      // Show options
      if (Platform.OS === 'web') {
        // For web, directly open gallery
        console.log('🌐 Web platform detected, opening gallery directly');
        await openGallery();
      } else {
        // For mobile, show Alert with options
        console.log('📱 Mobile platform, showing Alert options');
        
        Alert.alert(
          'Select Image',
          'Choose an option',
          [
            {
              text: 'Take Photo',
              onPress: () => {
                console.log('✅ User selected: Take Photo');
                console.log('⏰ Setting timeout to open camera...');
                setTimeout(() => {
                  console.log('⏰ Timeout fired, calling openCamera');
                  openCamera();
                }, 300);
              },
            },
            {
              text: 'Choose from Gallery',
              onPress: () => {
                console.log('✅ User selected: Choose from Gallery');
                console.log('⏰ Setting timeout to open gallery...');
                setTimeout(() => {
                  console.log('⏰ Timeout fired, calling openGallery');
                  openGallery();
                }, 300);
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                console.log('❌ User cancelled selection');
              }
            },
          ],
          { cancelable: true }
        );
        
        console.log('📋 Alert.alert called, waiting for user selection...');
      }
    } catch (error) {
      console.error('❌ handleImageUpload error:', error);
      Alert.alert('Error', `Upload failed: ${error.message}`);
    }
  };

  // Analyze feed consumption
  const handleAnalysis = async () => {
    console.log('🔍 Analysis button clicked');
    console.log('Image URI:', imageUri);
    console.log('Flock ID:', flockId);
    console.log('API_URL:', API_URL);
    console.log('Platform:', Platform.OS);
    
    if (!imageUri) {
      Alert.alert('Error', 'Please upload a feed bowl image first');
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      
      // Add image file with platform-specific handling
      const filename = imageUri.split('/').pop() || `feed-${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      console.log('Image details:', { filename, type, platform: Platform.OS });
      
      // Platform-specific FormData construction
      if (Platform.OS === 'web') {
        // For web: fetch the image and convert to File object
        console.log('📱 Web platform - converting to File...');
        const response = await fetch(imageUri);
        const blob = await response.blob();
        console.log('Blob created:', blob.type, blob.size, 'bytes');
        
        // Ensure valid MIME type for backend validation
        let validType = type;
        if (!validType || !validType.match(/image\/(jpeg|jpg|png)/)) {
          validType = 'image/jpeg'; // Default to JPEG if type is missing or invalid
        }
        
        // Ensure filename has correct extension
        let validFilename = filename;
        if (!validFilename.match(/\.(jpg|jpeg|png)$/i)) {
          validFilename = `feed-${Date.now()}.jpg`;
        }
        
        // Convert Blob to File (required for proper multipart upload on web)
        const file = new File([blob], validFilename, { type: validType });
        console.log('File created:', file.name, file.type, file.size, 'bytes');
        formData.append('feedImage', file);
      } else {
        // For mobile: use the standard format
        console.log('📱 Mobile platform - using URI format');
        formData.append('feedImage', {
          uri: imageUri,
          name: filename,
          type: type,
        });
      }

      // Add optional fields
      if (actualWeight) {
        formData.append('actualWeight', actualWeight);
        console.log('Actual weight:', actualWeight);
      }
      if (feedType) {
        formData.append('feedType', feedType);
        console.log('Feed type:', feedType);
      }

      const apiEndpoint = `${API_URL}/predictions/daily-analysis/${flockId}`;
      console.log('🌐 Sending request to:', apiEndpoint);
      console.log('⏰ Waiting for ML analysis... (may take 60+ seconds)');
      
      // Use axios - increased timeout for ML processing
      const response = await axios.post(apiEndpoint, formData, {
        timeout: 90000, // 90 seconds for ML processing
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`📤 Upload progress: ${percentCompleted}%`);
        },
      });

      console.log('Response status:', response.status);
      console.log('✅ Analysis response:', response.data);

      if (response.data.success) {
        setAnalysisResult(response.data.data);
        Alert.alert('Success', `Day ${response.data.data.dayNumber} analysis completed!`);
      } else {
        console.error('❌ Analysis failed:', response.data.error);
        Alert.alert('Error', response.data.error || 'Analysis failed');
      }

    } catch (error) {
      console.error('❌ Analysis error:', error);
      Alert.alert('Error', `Failed to analyze: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save and navigate to flock profile
  const handleSave = () => {
    if (!analysisResult) {
      Alert.alert('Error', 'Please complete analysis first');
      return;
    }

    Alert.alert(
      'Success',
      'Daily analysis saved successfully!',
      [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to Flock Profile Screen
            navigation.replace('FlockProfile', { 
              flockId: flockId,
              refresh: Date.now()
            });
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Feed Analysis</Text>
        <Text style={styles.headerSubtitle}>{flockDetails.name}</Text>
        <Text style={styles.headerInfo}>
          {flockDetails.breed} - Week {flockDetails.ageInWeeks}
        </Text>
      </View>

      {/* Image Upload Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Step 1: Upload Feed Bowl Image</Text>
        <TouchableOpacity 
          style={styles.uploadButton} 
          onPress={handleImageUpload}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Text style={styles.uploadPlaceholderText}>📷 Tap to Upload Image</Text>
            </View>
          )}
        </TouchableOpacity>
        {imageUri && (
          <TouchableOpacity onPress={() => setImageUri(null)}>
            <Text style={styles.removeText}>Remove Image</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Weight and Feed Type Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Step 2: Enter Details (Optional)</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Actual Weight (grams)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter actual weight"
            keyboardType="numeric"
            value={actualWeight}
            onChangeText={setActualWeight}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Feed Type</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Starter Feed, Grower Feed"
            value={feedType}
            onChangeText={setFeedType}
          />
        </View>
      </View>

      {/* Analysis Button */}
      <TouchableOpacity 
        style={[styles.analyzeButton, isAnalyzing && styles.buttonDisabled]} 
        onPress={handleAnalysis}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.analyzeButtonText}>🔍 Analyze</Text>
        )}
      </TouchableOpacity>

      {/* Analysis Results */}
      {analysisResult && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>📊 Analysis Results</Text>

          {/* Current Day */}
          <View style={styles.resultCard}>
            <Text style={styles.resultCardTitle}>Today's Feed Consumption</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Consumed:</Text>
              <Text style={[
                styles.resultValue,
                analysisResult.currentDay.status === 'Good' 
                  ? styles.goodStatus 
                  : styles.badStatus
              ]}>
                {analysisResult.currentDay.feedConsumption}%
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={[
                styles.statusText,
                analysisResult.currentDay.status === 'Good' 
                  ? styles.goodText 
                  : styles.badText
              ]}>
                {analysisResult.currentDay.status === 'Good' ? '✅ Good' : '⚠️ Bad'}
              </Text>
            </View>
          </View>

          {/* Next Day Prediction */}
          <View style={styles.resultCard}>
            <Text style={styles.resultCardTitle}>Tomorrow's Prediction</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Expected Consumption:</Text>
              <Text style={[
                styles.resultValue,
                analysisResult.nextDay.status === 'Good' 
                  ? styles.goodStatus 
                  : styles.badStatus
              ]}>
                {analysisResult.nextDay.feedPrediction}%
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={[
                styles.statusText,
                analysisResult.nextDay.status === 'Good' 
                  ? styles.goodText 
                  : styles.badText
              ]}>
                {analysisResult.nextDay.status === 'Good' ? '✅ Good' : '⚠️ Bad'}
              </Text>
            </View>
          </View>

          {/* Weight Prediction */}
          <View style={styles.resultCard}>
            <Text style={styles.resultCardTitle}>Weight Analysis</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Predicted Weight:</Text>
              <Text style={styles.resultValue}>
                {analysisResult.weightPrediction.predicted}g
              </Text>
            </View>
            {analysisResult.weightPrediction.actual && (
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Actual Weight:</Text>
                <Text style={styles.resultValue}>
                  {analysisResult.weightPrediction.actual}g
                </Text>
              </View>
            )}
          </View>

          {/* Feed Type */}
          {analysisResult.feedType && (
            <View style={styles.resultCard}>
              <Text style={styles.resultCardTitle}>Feed Type</Text>
              <Text style={styles.resultValue}>{analysisResult.feedType}</Text>
            </View>
          )}

          {/* Day Counter */}
          <View style={styles.dayCounter}>
            <Text style={styles.dayCounterText}>
              Day {analysisResult.totalDaysCompleted} of 7 completed
            </Text>
            {analysisResult.canGenerateFeedPlan && (
              <Text style={styles.readyBadge}>🎉 Ready for Feed Plan!</Text>
            )}
          </View>
        </View>
      )}

      {/* Save Button */}
      {analysisResult && (
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            💾 Save & Go to Flock Profile
          </Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#fff',
    marginTop: 5,
  },
  headerInfo: {
    fontSize: 14,
    color: '#e0e0e0',
    marginTop: 3,
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  uploadButton: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    borderRadius: 10,
  },
  uploadPlaceholderText: {
    fontSize: 16,
    color: '#666',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeText: {
    color: '#f44336',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  analyzeButton: {
    backgroundColor: '#2196F3',
    margin: 15,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsContainer: {
    margin: 15,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  goodStatus: {
    color: '#4CAF50',
  },
  badStatus: {
    color: '#f44336',
  },
  statusBadge: {
    marginTop: 5,
    alignItems: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  goodText: {
    color: '#4CAF50',
    backgroundColor: '#e8f5e9',
  },
  badText: {
    color: '#f44336',
    backgroundColor: '#ffebee',
  },
  dayCounter: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayCounterText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  readyBadge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    margin: 15,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DailyAnalysisScreen;
