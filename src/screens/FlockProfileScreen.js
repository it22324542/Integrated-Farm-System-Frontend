import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  StyleSheet,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../config/api';

const FlockDetailScreen = ({ route, navigation }) => {
  const { flockId, refresh } = route.params;
  
  const [flockData, setFlockData] = useState(null);
  const [dailyRecords, setDailyRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchFlockData();
  }, [refresh]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchFlockData();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchFlockData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/predictions/daily-analysis/${flockId}`);
      const data = await response.json();

      if (data.success) {
        setFlockData(data.data.flockDetails);
        setDailyRecords(data.data.dailyAnalysisRecords || []);
      }
    } catch (error) {
      console.error('Error fetching flock data:', error);
      Alert.alert('Error', 'Failed to load flock data');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (dayNumber) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Alert.alert(
      'Upload Image',
      `Upload image for Day ${dayNumber}`,
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });

            if (!result.canceled) {
              navigation.navigate('DailyAnalysis', {
                flockId,
                flockDetails: flockData,
                imageUri: result.assets[0].uri
              });
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });

            if (!result.canceled) {
              navigation.navigate('DailyAnalysis', {
                flockId,
                flockDetails: flockData,
                imageUri: result.assets[0].uri
              });
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || galleryStatus !== 'granted') {
      Alert.alert('Permissions Required', 'Camera and gallery permissions are needed.');
      return false;
    }
    return true;
  };

  const handleGenerateFeedPlan = () => {
    Alert.alert(
      'Generate Feed Plan',
      'Analyzing 7 days of data to create optimized feed plan...',
      [
        {
          text: 'Continue',
          onPress: () => {
            navigation.navigate('FeedOptimizationNew', { 
              flockId,
              dailyRecords 
            });
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading flock profile...</Text>
      </View>
    );
  }

  const completedDays = dailyRecords.length;
  const canGeneratePlan = completedDays >= 7;

  return (
    <ScrollView style={styles.container}>
      {/* Flock Details Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{flockData?.name}</Text>
        <View style={styles.headerDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Breed</Text>
            <Text style={styles.detailValue}>{flockData?.breed}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Age</Text>
            <Text style={styles.detailValue}>{flockData?.ageInWeeks} weeks</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Count</Text>
            <Text style={styles.detailValue}>{flockData?.currentCount} birds</Text>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>
          Daily Analysis Progress: {completedDays}/7 Days
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(completedDays / 7) * 100}%` }
            ]} 
          />
        </View>
      </View>

      {/* Saved Daily Records */}
      {dailyRecords.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Saved Daily Records</Text>
          {dailyRecords.map((record, index) => (
            <View key={index} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordDay}>Day {record.dayNumber}</Text>
                <Text style={styles.recordDate}>
                  {new Date(record.date).toLocaleDateString()}
                </Text>
              </View>
              
              {/* Image */}
              <Image 
                source={{ uri: `${API_URL}${record.imageUrl}` }} 
                style={styles.recordImage} 
              />
              
              {/* Analysis Summary */}
              <View style={styles.recordDetails}>
                <View style={styles.recordRow}>
                  <Text style={styles.recordLabel}>Feed Consumed:</Text>
                  <Text style={[
                    styles.recordValue,
                    record.currentDayStatus === 'Good' 
                      ? styles.goodText 
                      : styles.badText
                  ]}>
                    {record.currentDayFeedConsumption}% 
                    {record.currentDayStatus === 'Good' ? ' ✅' : ' ⚠️'}
                  </Text>
                </View>
                
                {record.predictedWeight && (
                  <View style={styles.recordRow}>
                    <Text style={styles.recordLabel}>Predicted Weight:</Text>
                    <Text style={styles.recordValue}>
                      {record.predictedWeight}g
                    </Text>
                  </View>
                )}
                
                {record.actualWeight && (
                  <View style={styles.recordRow}>
                    <Text style={styles.recordLabel}>Actual Weight:</Text>
                    <Text style={styles.recordValue}>
                      {record.actualWeight}g
                    </Text>
                  </View>
                )}
                
                {record.feedType && (
                  <View style={styles.recordRow}>
                    <Text style={styles.recordLabel}>Feed Type:</Text>
                    <Text style={styles.recordValue}>
                      {record.feedType}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Upload Boxes for Remaining Days */}
      {completedDays < 7 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📷 Upload Images for Remaining Days
          </Text>
          <View style={styles.uploadGrid}>
            {[...Array(7 - completedDays)].map((_, index) => {
              const dayNumber = completedDays + index + 1;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.uploadBox}
                  onPress={() => handleImageUpload(dayNumber)}
                >
                  <Text style={styles.uploadBoxIcon}>📷</Text>
                  <Text style={styles.uploadBoxText}>Day {dayNumber}</Text>
                  <Text style={styles.uploadBoxSubtext}>Tap to upload</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Generate Feed Plan Button */}
      {canGeneratePlan && (
        <TouchableOpacity 
          style={styles.feedPlanButton} 
          onPress={handleGenerateFeedPlan}
        >
          <Text style={styles.feedPlanButtonText}>
            🌾 Generate Feed Plan
          </Text>
          <Text style={styles.feedPlanButtonSubtext}>
            Optimize feeding based on 7-day analysis
          </Text>
        </TouchableOpacity>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.actionButtonText}>← Back to Flocks</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  headerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#e0e0e0',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressSection: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  progressBar: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  section: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  recordDay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  recordDate: {
    fontSize: 14,
    color: '#666',
  },
  recordImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  recordDetails: {
    padding: 15,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recordLabel: {
    fontSize: 14,
    color: '#666',
  },
  recordValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  goodText: {
    color: '#4CAF50',
  },
  badText: {
    color: '#f44336',
  },
  uploadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  uploadBox: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadBoxIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  uploadBoxText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  uploadBoxSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  feedPlanButton: {
    backgroundColor: '#FF9800',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  feedPlanButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  feedPlanButtonSubtext: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
    opacity: 0.9,
  },
  actionButtons: {
    margin: 15,
  },
  actionButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FlockDetailScreen;
