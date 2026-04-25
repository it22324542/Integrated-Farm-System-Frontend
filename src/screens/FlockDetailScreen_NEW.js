import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../config/apiConfig';

const FlockDetailScreen = ({ route, navigation }) => {
  const { flockId, flockData } = route.params;
  const [flock, setFlock] = useState(flockData || null);
  const [currentFeedPlan, setCurrentFeedPlan] = useState(null);
  const [weeklyTracking, setWeeklyTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadingDay, setUploadingDay] = useState(null);

  useEffect(() => {
    fetchFlockDetails();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchFlockDetails();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchFlockDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch flock details with feed plans and weekly tracking
      const response = await fetch(`${API_URL}/flocks/${flockId}`);
      const data = await response.json();
      
      if (data.success) {
        const flockData = data.data;
        setFlock(flockData);
        
        // Get active feed plan
        const activePlan = flockData.feedPlans?.find(plan => plan.isActive);
        setCurrentFeedPlan(activePlan);
        
        // Get current week's tracking
        const currentWeek = flockData.weeklyFeedTracking?.find(week => !week.isComplete) || null;
        setWeeklyTracking(currentWeek);
      }
    } catch (error) {
      console.error('Error fetching flock details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (dayNumber) => {
    try {
      // Check if this day already has an image
      const dailyRecords = weeklyTracking?.dailyRecords || [];
      if (dailyRecords.find(r => r.dayNumber === dayNumber)) {
        Alert.alert('Already Uploaded', 'This day already has a feed image');
        return;
      }

      // For web, use file input
      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (file) {
            await uploadImage(file, dayNumber);
          }
        };
        input.click();
      } else {
        // For mobile, show alert
        Alert.alert(
          'Upload Image',
          'Choose an option',
          [
            {
              text: 'Take Photo',
              onPress: () => takePhoto(dayNumber)
            },
            {
              text: 'Choose from Gallery',
              onPress: () => pickImage(dayNumber)
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error in handleImageUpload:', error);
    }
  };

  const pickImage = async (dayNumber) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      await uploadImage(result.assets[0], dayNumber);
    }
  };

  const takePhoto = async (dayNumber) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      await uploadImage(result.assets[0], dayNumber);
    }
  };

  const uploadImage = async (imageData, dayNumber) => {
    try {
      setUploading(true);
      setUploadingDay(dayNumber);

      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        formData.append('feedImage', imageData);
      } else {
        const uri = imageData.uri;
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('feedImage', {
          uri: uri,
          name: filename,
          type: type
        });
      }

      const response = await fetch(`${API_URL}/predictions/upload-feed-image/${flockId}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        const statusEmoji = data.data.status === 'good' ? '✅' : '⚠️';
        Alert.alert(
          'Success!',
          `Day ${dayNumber} uploaded!\n${statusEmoji} ${data.data.statusMessage}\nFeed Consumption: ${data.data.feedConsumedPercentage}%`,
          [{ text: 'OK', onPress: () => fetchFlockDetails() }]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload Failed', 'Could not upload the image. Please try again.');
    } finally {
      setUploading(false);
      setUploadingDay(null);
    }
  };

  const handleAnalyzeWeek = () => {
    if (!weeklyTracking || !weeklyTracking.isComplete) {
      Alert.alert('Not Ready', 'Please upload all 7 days of feed images first');
      return;
    }

    navigation.navigate('WeeklyAnalysis', {
      flockId: flockId,
      weekNumber: weeklyTracking.weekNumber,
      weeklyTracking: weeklyTracking
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading flock profile...</Text>
      </View>
    );
  }

  if (!flock) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Flock not found</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyRecords = weeklyTracking?.dailyRecords || [];
  const isWeekComplete = weeklyTracking?.isComplete || false;
  const currentWeekNumber = weeklyTracking?.weekNumber || Math.floor(flock.ageInWeeks);

  return (
    <ScrollView style={styles.container}>
      {/* Flock Info Card */}
      <View style={styles.flockInfoCard}>
        <Text style={styles.cardTitle}>🐔 {flock.name}</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Breed</Text>
            <Text style={styles.infoValue}>{flock.breed}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Age</Text>
            <Text style={styles.infoValue}>{flock.ageInWeeks}w / {flock.ageInWeeks * 7}d</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Count</Text>
            <Text style={styles.infoValue}>{flock.currentCount || flock.initialCount}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Stage</Text>
            <Text style={styles.infoValue}>{flock.ageInWeeks <= 6 ? 'Starter' : flock.ageInWeeks <= 18 ? 'Grower' : 'Layer'}</Text>
          </View>
        </View>
      </View>

      {/* Active Feed Plan */}
      {currentFeedPlan && (
        <View style={styles.feedPlanCard}>
          <Text style={styles.cardTitle}>🌾 Active Feed Plan (Week {currentFeedPlan.weekNumber})</Text>
          <View style={styles.feedPlanContent}>
            <View style={styles.feedPlanRow}>
              <Text style={styles.feedPlanLabel}>Feed Type:</Text>
              <Text style={styles.feedPlanValue}>{currentFeedPlan.feedType}</Text>
            </View>
            <View style={styles.feedPlanRow}>
              <Text style={styles.feedPlanLabel}>Expected Weight:</Text>
              <Text style={styles.feedPlanValue}>{currentFeedPlan.predictedWeight}g</Text>
            </View>
            <View style={styles.recommendationBox}>
              <Text style={styles.recommendationText}>{currentFeedPlan.recommendation}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Weekly Feed Tracker */}
      <View style={styles.weeklyTrackerCard}>
        <Text style={styles.cardTitle}>📊 Weekly Feed Monitoring (Week {currentWeekNumber})</Text>
        <Text style={styles.subtitle}>
          Day {dailyRecords.length} of 7
        </Text>
        
        {!isWeekComplete && (
          <Text style={styles.instructionText}>
            📸 Tap on empty boxes to upload daily feed images
          </Text>
        )}

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.daysContainer}
        >
          {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
            const record = dailyRecords.find(r => r.dayNumber === dayNum);
            const dayName = days[dayNum - 1];
            const isUploadingThis = uploadingDay === dayNum;

            return (
              <View key={dayNum} style={styles.dayBox}>
                <Text style={styles.dayLabel}>{dayName}</Text>
                <Text style={styles.dayNumber}>Day {dayNum}</Text>
                
                {record ? (
                  <View style={styles.recordContainer}>
                    <Image
                      source={{ uri: `http://localhost:3000${record.imageUrl}` }}
                      style={styles.feedImage}
                      resizeMode="cover"
                    />
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: record.status === 'good' ? '#4CAF50' : '#FF9800' }
                    ]}>
                      <Text style={styles.statusText}>
                        {record.status === 'good' ? '✅ Good' : '⚠️ Low'}
                      </Text>
                    </View>
                    <View style={styles.percentageBadge}>
                      <Text style={styles.percentageText}>
                        {record.feedConsumedPercentage}%
                      </Text>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.emptyBox, isUploadingThis && styles.uploadingBox]}
                    onPress={() => !uploading && !isWeekComplete && handleImageUpload(dayNum)}
                    disabled={uploading || isWeekComplete}
                  >
                    {isUploadingThis ? (
                      <ActivityIndicator size="small" color="#4CAF50" />
                    ) : (
                      <>
                        <Text style={styles.uploadIcon}>📷</Text>
                        <Text style={styles.uploadText}>Tap to{'\n'}Upload</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Analyze Week Button */}
        {isWeekComplete && (
          <TouchableOpacity 
            style={styles.analyzeButton}
            onPress={handleAnalyzeWeek}
          >
            <Text style={styles.analyzeButtonText}>📊 Analyze This Week</Text>
          </TouchableOpacity>
        )}

        {isWeekComplete && weeklyTracking.overallAnalysis && (
          <View style={styles.quickSummary}>
            <Text style={styles.quickSummaryTitle}>Quick Summary:</Text>
            <Text style={styles.quickSummaryText}>
              Average Consumption: {weeklyTracking.overallAnalysis.averageConsumption}%
            </Text>
            <Text style={styles.quickSummaryStatus}>
              {weeklyTracking.overallAnalysis.message}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('FlockCreation', { flock: flock, editMode: true })}
        >
          <Text style={styles.editButtonText}>✏️ Edit Flock Details</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacing} />
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
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  flockInfoCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  feedPlanCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  week lyTrackerCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  feedPlanContent: {
    marginTop: 8,
  },
  feedPlanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  feedPlanLabel: {
    fontSize: 14,
    color: '#666',
  },
  feedPlanValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  recommendationBox: {
    backgroundColor: '#FFF9C4',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  recommendationText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
  },
  instructionText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  daysContainer: {
    marginVertical: 12,
  },
  dayBox: {
    width: 120,
    marginRight: 12,
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  dayNumber: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recordContainer: {
    width: '100%',
    position: 'relative',
  },
  feedImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  statusBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  percentageBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  percentageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyBox: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingBox: {
    backgroundColor: '#E8F5E9',
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  uploadText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  analyzeButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickSummary: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  quickSummaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  quickSummaryText: {
    fontSize: 13,
    color: '#1B5E20',
    marginBottom: 4,
  },
  quickSummaryStatus: {
    fontSize: 12,
    color: '#388E3C',
  },
  actionsContainer: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  editButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 30,
  },
});

export default FlockDetailScreen;
