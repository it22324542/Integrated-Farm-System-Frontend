import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../services/poultryService';

/**
 * Step 2: Image Upload Screen
 * User uploads image of poultry for detailed health analysis
 * Only accessible if sound analysis detected unhealthy sounds
 */
const ImageUploadScreen = ({ navigation, route }) => {
  const { soundPredictionId } = route.params || {};
  
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null);

  /**
   * Request camera permissions
   */
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos'
      );
      return false;
    }
    return true;
  };

  /**
   * Request gallery permissions
   */
  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Gallery permission is required to select photos'
      );
      return false;
    }
    return true;
  };

  /**
   * Take photo with camera
   */
  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        console.log('Camera result:', image);
        
        // On web, extract the File object if available
        const fileData = Platform.OS === 'web' && image.file ? image.file : {
          uri: image.uri,
          name: `poultry_${Date.now()}.jpg`,
          type: 'image/jpeg',
        };
        
        console.log('Camera file data to upload:', fileData);
        setImageFile(fileData);
        setResult(null); // Reset previous result
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  /**
   * Pick image from gallery
   */
  const pickFromGallery = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        console.log('Gallery result:', image);
        
        // On web, extract the File object if available
        const fileData = Platform.OS === 'web' && image.file ? image.file : {
          uri: image.uri,
          name: `poultry_${Date.now()}.jpg`,
          type: 'image/jpeg',
        };
        
        console.log('File data to upload:', fileData);
        setImageFile(fileData);
        setResult(null); // Reset previous result
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  /**
   * Show image source picker
   */
  const showImagePicker = () => {
    Alert.alert(
      'Select Image Source',
      'Choose where to get the poultry image from',
      [
        {
          text: 'Camera',
          onPress: takePhoto,
        },
        {
          text: 'Gallery',
          onPress: pickFromGallery,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  /**
   * Upload image file and analyze
   */
  const handleUpload = async () => {
    if (!imageFile) {
      Alert.alert('No Image', 'Please select an image first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const response = await uploadImage(imageFile, (progress) => {
        setUploadProgress(progress);
      });

      if (response.success) {
        setResult(response);
        
        // Show result alert
        Alert.alert(
          'Analysis Complete',
          response.message,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', response.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to upload and analyze image'
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  /**
   * Reset and start over
   */
  const resetUpload = () => {
    setImageFile(null);
    setResult(null);
    setUploadProgress(0);
  };

  /**
   * Go back to sound upload
   */
  const goBackToSound = () => {
    navigation.goBack();
  };

  /**
   * Navigate to Step 3: Dropping Disease Detection
   */
  const goToDropping = () => {
    navigation.navigate('DroppingUpload', {
      imagePredictionId: result?.prediction_id,
    });
  };

  /**
   * Get result color based on outcome
   */
  const getResultColor = (resultType) => {
    return resultType === 'Healthy' ? '#4CAF50' : '#F44336';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Step 2: Image Analysis</Text>
        <Text style={styles.subtitle}>
          Upload a clear image of the poultry for detailed health assessment
        </Text>
      </View>

      {/* Image Picker Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Image</Text>
        
        {imageFile && (
          <View style={styles.imagePreview}>
            <Image 
              source={{ uri: imageFile.uri }} 
              style={styles.previewImage}
              resizeMode="cover"
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.pickButton, styles.cameraButton]}
          onPress={takePhoto}
          disabled={uploading}
        >
          <Text style={styles.pickButtonText}>📷 Camera</Text>
        </TouchableOpacity>

        {imageFile && (
          <View style={styles.fileInfo}>
            <Text style={styles.fileInfoText}>Image ready for analysis</Text>
          </View>
        )}
      </View>

      {/* Upload Button */}
      {imageFile && !result && (
        <TouchableOpacity
          style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.uploadButtonText}>
                Analyzing... {uploadProgress}%
              </Text>
            </View>
          ) : (
            <Text style={styles.uploadButtonText}>Analyze Image</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Result Display */}
      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Analysis Result</Text>
          
          <View
            style={[
              styles.resultBox,
              { borderColor: getResultColor(result.result) },
            ]}
          >
            <Text
              style={[styles.resultText, { color: getResultColor(result.result) }]}
            >
              {result.result}
            </Text>
            {result.confidence && (
              <Text style={styles.confidenceText}>
                Confidence: {(result.confidence * 100).toFixed(1)}%
              </Text>
            )}
          </View>

          <Text style={styles.resultMessage}>{result.message}</Text>
          {/* Proceed to Step 3 when Unhealthy */}
          {result.result === 'Unhealthy' && (
            <TouchableOpacity
              style={styles.proceedButton}
              onPress={goToDropping}
            >
              <Text style={styles.proceedButtonText}>🔬 Proceed to Disease Detection (Step 3)</Text>
            </TouchableOpacity>
          )}
          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.resetButton]}
              onPress={resetUpload}
            >
              <Text style={styles.actionButtonText}>Analyze Another</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.backButton]}
              onPress={goBackToSound}
            >
              <Text style={styles.actionButtonText}>Back to Sound</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Instructions:</Text>
        <Text style={styles.instructionsText}>
          1. Take a clear photo or select from gallery{'\n'}
          2. Ensure good lighting and the poultry is visible{'\n'}
          3. Avoid blurry or dark images{'\n'}
          4. Supported formats: JPEG, PNG{'\n'}
          5. The system will analyze visual health indicators
        </Text>
      </View>

      {soundPredictionId && (
        <View style={styles.linkedInfo}>
          <Text style={styles.linkedInfoText}>
            📎 Linked to sound analysis: {soundPredictionId.substring(0, 8)}...
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  imagePreview: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickButton: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: '#FF5722',
  },
  galleryButton: {
    backgroundColor: '#2196F3',
  },
  pickButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fileInfo: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  fileInfoText: {
    color: '#2E7D32',
    fontSize: 14,
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  resultBox: {
    borderWidth: 3,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  resultText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  confidenceText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  resultMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  resetButton: {
    backgroundColor: '#FF9800',
  },
  backButton: {
    backgroundColor: '#757575',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: '#E1F5FE',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#01579B',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#01579B',
    lineHeight: 20,
  },
  linkedInfo: {
    backgroundColor: '#F3E5F5',
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
  },
  linkedInfoText: {
    fontSize: 12,
    color: '#6A1B9A',
    textAlign: 'center',
  },
  proceedButton: {
    backgroundColor: '#7B1FA2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ImageUploadScreen;
