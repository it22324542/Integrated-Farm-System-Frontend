import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { uploadSound } from '../services/poultryService';

/**
 * Step 1: Sound Upload Screen
 * User uploads audio of poultry sounds for initial health check
 */
const SoundUploadScreen = ({ navigation }) => {
  const [audioFile, setAudioFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null);

  /**
   * Pick audio file from device
   */
  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success' || !result.canceled) {
        const file = result.assets ? result.assets[0] : result;
        setAudioFile({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'audio/wav',
        });
        setResult(null); // Reset previous result
      }
    } catch (error) {
      console.error('Error picking audio file:', error);
      Alert.alert('Error', 'Failed to pick audio file');
    }
  };

  /**
   * Upload audio file and analyze
   */
  const handleUpload = async () => {
    if (!audioFile) {
      Alert.alert('No File', 'Please select an audio file first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const response = await uploadSound(audioFile, (progress) => {
        setUploadProgress(progress);
      });

      if (response.success) {
        setResult(response);
        
        // Show result alert
        Alert.alert(
          'Analysis Complete',
          response.message,
          [
            {
              text: 'OK',
              onPress: () => {
                // If result is "Sick" (Unhealthy), navigate to image upload
                if (response.result === 'Sick') {
                  Alert.alert(
                    'Next Step',
                    'Unhealthy sound detected. Would you like to upload an image for detailed analysis?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Upload Image',
                        onPress: () => navigation.navigate('ImageUpload', { 
                          soundPredictionId: response.prediction_id 
                        }),
                      },
                    ]
                  );
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to upload and analyze audio'
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  /**
   * Manually navigate to image upload
   */
  const navigateToImageUpload = () => {
    if (result && result.result === 'Sick') {
      navigation.navigate('ImageUpload', { 
        soundPredictionId: result.prediction_id 
      });
    }
  };

  /**
   * Reset and start over
   */
  const resetUpload = () => {
    setAudioFile(null);
    setResult(null);
    setUploadProgress(0);
  };

  /**
   * Get result color based on outcome
   */
  const getResultColor = (resultType) => {
    switch (resultType) {
      case 'Healthy':
        return '#4CAF50';
      case 'Sick':
        return '#F44336';
      default:
        return '#FF9800';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Step 1: Sound Analysis</Text>
        <Text style={styles.subtitle}>
          Upload a recording of poultry sounds to check for health indicators
        </Text>
      </View>

      {/* File Picker Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Audio File</Text>
        <TouchableOpacity
          style={styles.pickButton}
          onPress={pickAudioFile}
          disabled={uploading}
        >
          <Text style={styles.pickButtonText}>
            {audioFile ? 'Change Audio File' : 'Pick Audio File'}
          </Text>
        </TouchableOpacity>

        {audioFile && (
          <View style={styles.fileInfo}>
            <Text style={styles.fileInfoText}>Selected: {audioFile.name}</Text>
          </View>
        )}
      </View>

      {/* Upload Button */}
      {audioFile && !result && (
        <TouchableOpacity
          style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.uploadButtonText}>
                Uploading... {uploadProgress}%
              </Text>
            </View>
          ) : (
            <Text style={styles.uploadButtonText}>Analyze Sound</Text>
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
              {result.result === 'Sick' ? 'Unhealthy' : result.result}
            </Text>
            {result.confidence && (
              <Text style={styles.confidenceText}>
                Confidence: {(result.confidence * 100).toFixed(1)}%
              </Text>
            )}
          </View>

          <Text style={styles.resultMessage}>{result.message}</Text>

          {/* Navigation Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.resetButton]}
              onPress={resetUpload}
            >
              <Text style={styles.actionButtonText}>Upload Another</Text>
            </TouchableOpacity>

            {result.result === 'Sick' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.nextButton]}
                onPress={navigateToImageUpload}
              >
                <Text style={styles.actionButtonText}>Next: Image Upload</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Instructions:</Text>
        <Text style={styles.instructionsText}>
          1. Record or select an audio file of poultry sounds{'\n'}
          2. Ensure the recording is clear and contains poultry vocalizations{'\n'}
          3. Supported formats: WAV, MP3, OGG, M4A, FLAC{'\n'}
          4. If unhealthy sounds are detected, you'll proceed to image analysis
        </Text>
      </View>
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
  pickButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  pickButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fileInfo: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  fileInfoText: {
    color: '#1976D2',
    fontSize: 14,
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  resetButton: {
    backgroundColor: '#757575',
  },
  nextButton: {
    backgroundColor: '#FF5722',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: '#FFF9C4',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57F17',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#F57F17',
    lineHeight: 20,
  },
});

export default SoundUploadScreen;
