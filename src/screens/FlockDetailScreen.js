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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { BarChart } from 'react-native-chart-kit';
import { API_URL } from '../config/apiConfig';
import { useTheme } from '../context/ThemeContext';

const screenWidth = Dimensions.get('window').width;
const isWeb = Platform.OS === 'web';

const FlockDetailScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
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
      
      if (!flockId) {
        Alert.alert('Error', 'Flock ID is missing');
        navigation.goBack();
        return;
      }
      
      console.log('🔍 Fetching flock details for ID:', flockId);
      
      // Fetch flock details with feed plans and weekly tracking
      const response = await fetch(`${API_URL}/flocks/${flockId}`);
      const data = await response.json();
      
      console.log('📦 Flock data received:', {
        flockId: data.data?._id,
        flockName: data.data?.name,
        feedPlansCount: data.data?.feedPlans?.length,
        weeklyTrackingCount: data.data?.weeklyFeedTracking?.length
      });
      
      if (data.success) {
        const flockData = data.data;
        setFlock(flockData);
        
        // Get active feed plan
        const activePlan = flockData.feedPlans?.find(plan => plan.isActive);
        setCurrentFeedPlan(activePlan);
        
        // Get current week's tracking - prioritize incomplete week, fallback to most recent
        let currentWeek = flockData.weeklyFeedTracking?.find(week => !week.isComplete);
        if (!currentWeek && flockData.weeklyFeedTracking?.length > 0) {
          // If no incomplete week, show the most recently completed week
          currentWeek = flockData.weeklyFeedTracking[flockData.weeklyFeedTracking.length - 1];
        }
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
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading flock details...</Text>
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Flock Info Card */}
      <View style={[styles.flockInfoCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>🐔 {flock.name}</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Breed</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{flock.breed}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Age</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{flock.ageInWeeks}w / {flock.ageInWeeks * 7}d</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Count</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{flock.currentCount || flock.initialCount}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Stage</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{flock.ageInWeeks <= 6 ? 'Starter' : flock.ageInWeeks <= 18 ? 'Grower' : 'Layer'}</Text>
          </View>
        </View>
      </View>

      {/* Active Feed Plan with Gradient */}
      {currentFeedPlan && (
        <LinearGradient
          colors={['rgba(255, 193, 7, 0.3)', 'rgba(255, 193, 7, 0.15)']}
          style={styles.feedPlanCard}
        >
          <View style={styles.feedPlanHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>🌾 Active Feed Plan</Text>
            <View style={styles.weekBadge}>
              <Text style={styles.weekBadgeText}>Week {currentFeedPlan.weekNumber}</Text>
            </View>
          </View>
          
          <View style={styles.feedPlanContent}>
            {/* Feed Type */}
            <View style={[styles.feedPlanInfoBox, { backgroundColor: colors.card, opacity: 0.9 }]}>
              <Text style={[styles.feedPlanLabel, { color: colors.textSecondary }]}>🌾 Feed Type</Text>
              <Text style={[styles.feedPlanValue, { color: colors.text }]}>{currentFeedPlan.feedType}</Text>
            </View>
            
            {/* Expected Weight with Progress */}
            <View style={[styles.feedPlanInfoBox, { backgroundColor: colors.card, opacity: 0.9 }]}>
              <Text style={[styles.feedPlanLabel, { color: colors.textSecondary }]}>⚖️ Expected Weight</Text>
              <Text style={[styles.feedPlanValue, { color: colors.text }]}>{currentFeedPlan.predictedWeight}g</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${Math.min((currentFeedPlan.predictedWeight / 2000) * 100, 100)}%` }
                    ]} 
                  />
                </View>
              </View>
            </View>

            {/* Nutrition Details - ALWAYS VISIBLE */}
            {currentFeedPlan.nutritionDetails && (
              <View style={[styles.nutritionCard, { backgroundColor: colors.card, opacity: 0.95, borderWidth: 2, borderColor: '#10B981' }]}>
                <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 18, marginBottom: 16 }]}>📊 Complete Nutrition Analysis (8 Metrics)</Text>
                <View style={styles.nutritionGrid}>
                  <View style={[styles.nutritionItem, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <Text style={[styles.nutritionLabel, { color: colors.textSecondary, fontWeight: 'bold' }]}>CRUDE PROTEIN</Text>
                    <Text style={[styles.nutritionValue, { color: '#10B981', fontSize: 18 }]}>{currentFeedPlan.nutritionDetails.crudeProtein}%</Text>
                  </View>
                  <View style={[styles.nutritionItem, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <Text style={[styles.nutritionLabel, { color: colors.textSecondary, fontWeight: 'bold' }]}>ENERGY</Text>
                    <Text style={[styles.nutritionValue, { color: '#10B981', fontSize: 18 }]}>{currentFeedPlan.nutritionDetails.metabolizableEnergy} kcal/kg</Text>
                  </View>
                  <View style={[styles.nutritionItem, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <Text style={[styles.nutritionLabel, { color: colors.textSecondary, fontWeight: 'bold' }]}>CALCIUM</Text>
                    <Text style={[styles.nutritionValue, { color: '#10B981', fontSize: 18 }]}>{currentFeedPlan.nutritionDetails.calcium}%</Text>
                  </View>
                  <View style={[styles.nutritionItem, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <Text style={[styles.nutritionLabel, { color: colors.textSecondary, fontWeight: 'bold' }]}>PHOSPHORUS</Text>
                    <Text style={[styles.nutritionValue, { color: '#10B981', fontSize: 18 }]}>{currentFeedPlan.nutritionDetails.phosphorus}%</Text>
                  </View>
                  <View style={[styles.nutritionItem, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                    <Text style={[styles.nutritionLabel, { color: colors.textSecondary, fontWeight: 'bold' }]}>LYSINE</Text>
                    <Text style={[styles.nutritionValue, { color: '#3B82F6', fontSize: 18 }]}>{currentFeedPlan.nutritionDetails.lysine}%</Text>
                  </View>
                  <View style={[styles.nutritionItem, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                    <Text style={[styles.nutritionLabel, { color: colors.textSecondary, fontWeight: 'bold' }]}>METHIONINE</Text>
                    <Text style={[styles.nutritionValue, { color: '#3B82F6', fontSize: 18 }]}>{currentFeedPlan.nutritionDetails.methionine}%</Text>
                  </View>
                  <View style={[styles.nutritionItem, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                    <Text style={[styles.nutritionLabel, { color: colors.textSecondary, fontWeight: 'bold' }]}>FIBER</Text>
                    <Text style={[styles.nutritionValue, { color: '#F59E0B', fontSize: 18 }]}>{currentFeedPlan.nutritionDetails.fiber}%</Text>
                  </View>
                  <View style={[styles.nutritionItem, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                    <Text style={[styles.nutritionLabel, { color: colors.textSecondary, fontWeight: 'bold' }]}>FAT</Text>
                    <Text style={[styles.nutritionValue, { color: '#F59E0B', fontSize: 18 }]}>{currentFeedPlan.nutritionDetails.fat}%</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Feed Ingredients - ALWAYS VISIBLE */}
            {currentFeedPlan.feedIngredients && currentFeedPlan.feedIngredients.length > 0 && (
              <View style={[styles.ingredientsCard, { backgroundColor: colors.card, opacity: 0.95, borderWidth: 2, borderColor: '#F59E0B' }]}>
                <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 18, marginBottom: 16 }]}>🌽 Complete Feed Composition ({currentFeedPlan.feedIngredients.length} Ingredients)</Text>
                {currentFeedPlan.feedIngredients.map((ingredient, index) => (
                  <View key={index} style={[styles.ingredientRow, { backgroundColor: 'rgba(245, 158, 11, 0.08)', padding: 12, borderRadius: 8, marginBottom: 8 }]}>
                    <Text style={[styles.ingredientName, { color: colors.text, fontSize: 15, fontWeight: 'bold' }]}>{ingredient.name}</Text>
                    <View style={styles.ingredientBarContainer}>
                      <View style={[styles.ingredientBarBg, { backgroundColor: colors.border, height: 32 }]}>
                        <View 
                          style={[styles.ingredientBarFill, { width: `${ingredient.percentage}%`, height: 32 }]} 
                        />
                      </View>
                      <Text style={[styles.ingredientPercentage, { color: '#F59E0B', fontSize: 16, fontWeight: 'bold' }]}>{ingredient.percentage}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
            
            <View style={[styles.recommendationBox, { backgroundColor: colors.card, opacity: 0.95 }]}>
              <Text style={styles.recommendationIcon}>💡</Text>
              <Text style={[styles.recommendationText, { color: colors.text }]}>{currentFeedPlan.recommendation}</Text>
            </View>
          </View>
        </LinearGradient>
      )}

      {/* Weekly Feed Tracker */}
      <View style={[styles.weeklyTrackerCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>📊 Weekly Feed Monitoring (Week {currentWeekNumber})</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
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
                <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>{dayName}</Text>
                <Text style={[styles.dayNumber, { color: colors.text }]}>Day {dayNum}</Text>
                
                {record ? (
                  <View style={styles.recordContainer}>
                    <Image
                      source={{ uri: `http://localhost:3000${record.imageUrl}` }}
                      style={styles.feedImage}
                      resizeMode="cover"
                    />
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: record.status === 'good' ? '#10B981' : '#F59E0B' }
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
                    {record.date && (
                      <Text style={[styles.uploadTimestamp, { color: colors.textTertiary }]}>
                        📅 {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {new Date(record.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.emptyBox, { borderColor: colors.border, backgroundColor: colors.card }, isUploadingThis && styles.uploadingBox]}
                    onPress={() => !uploading && !isWeekComplete && handleImageUpload(dayNum)}
                    disabled={uploading || isWeekComplete}
                  >
                    {isUploadingThis ? (
                      <ActivityIndicator size="small" color="#10B981" />
                    ) : (
                      <>
                        <Text style={styles.uploadIcon}>📷</Text>
                        <Text style={[styles.uploadText, { color: colors.textSecondary }]}>Tap to{'\n'}Upload</Text>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
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
    backgroundColor: '#10B981',
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
  weeklyTrackerCard: {
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
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
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
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  feedPlanContent: {
    marginTop: 12,
  },
  feedPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weekBadge: {
    backgroundColor: '#F57C00',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  weekBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  feedPlanInfoBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  feedPlanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  feedPlanLabel: {
    fontSize: 13,
    marginBottom: 4,
    fontWeight: '500',
  },
  feedPlanValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  recommendationBox: {
    padding: 14,
    borderRadius: 10,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recommendationIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  recommendationText: {
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  instructionText: {
    fontSize: 13,
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
    fontWeight: '500',
  },
  dayNumber: {
    fontSize: 14,
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
  uploadTimestamp: {
    fontSize: 9,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyBox: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  uploadText: {
    fontSize: 11,
    textAlign: 'center',
  },
  analyzeButton: {
    backgroundColor: '#10B981',
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
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  quickSummaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  quickSummaryText: {
    fontSize: 13,
    marginBottom: 4,
  },
  quickSummaryStatus: {
    fontSize: 12,
  },
  actionsContainer: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  editButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  nutritionCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartNote: {
    fontSize: 10,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 11,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ingredientsCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  ingredientRow: {
    marginBottom: 10,
  },
  ingredientName: {
    fontSize: 13,
    marginBottom: 4,
    fontWeight: '500',
  },
  ingredientBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ingredientBarBg: {
    flex: 1,
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
    marginRight: 8,
  },
  ingredientBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 9,
  },
  ingredientPercentage: {
    fontSize: 13,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'right',
  },
  bottomSpacing: {
    height: 30,
  },
});

export default FlockDetailScreen;
