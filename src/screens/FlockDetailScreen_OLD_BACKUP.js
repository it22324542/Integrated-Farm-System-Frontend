import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Platform
} from 'react-native';
import axios from 'axios';
import { API_URL } from '../config/apiConfig';
import { useTheme } from '../context/ThemeContext';
import { TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import WeeklyFeedTracker from '../components/WeeklyFeedTracker';

const FlockDetailScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { flock } = route.params;
  const [predictions, setPredictions] = useState([]);
  const [feedPlans, setFeedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchFlockData();
  }, []);

  // Refresh when screen comes back into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setRefreshKey(prev => prev + 1);
    });

    return unsubscribe;
  }, [navigation]);

  const fetchFlockData = async () => {
    try {
      // Fetch both history and feed plans in parallel
      const [historyResponse, feedPlansResponse] = await Promise.all([
        axios.get(`${API_URL}/flocks/${flock._id}/history`),
        axios.get(`${API_URL}/feed-plans/${flock._id}`).catch(() => ({ data: { data: [] } }))
      ]);
      
      if (historyResponse.data.success) {
        setPredictions(historyResponse.data.data || []);
      }
      
      if (feedPlansResponse.data.success) {
        setFeedPlans(feedPlansResponse.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setPredictions([]);
      setFeedPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFlock = () => {
    console.log('Delete button clicked for flock:', flock._id);
    
    // Use native confirm dialog for web, Alert for mobile
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${flock.name}"?\n\nThis action cannot be undone.`
      );
      if (confirmed) {
        console.log('Delete confirmed (web), calling confirmDelete');
        confirmDelete();
      } else {
        console.log('Delete cancelled (web)');
      }
    } else {
      Alert.alert(
        'Delete Flock',
        `Are you sure you want to delete "${flock.name}"? This action cannot be undone.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => console.log('Delete cancelled')
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              console.log('Delete confirmed, calling confirmDelete');
              confirmDelete();
            }
          }
        ],
        { cancelable: true }
      );
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    console.log('confirmDelete called, starting deletion...');
    
    try {
      const response = await axios.delete(`${API_URL}/flocks/${flock._id}`);
      console.log('Delete response:', response.data);
      
      if (response.data.success) {
        // Show success message
        if (Platform.OS === 'web') {
          window.alert('Flock deleted successfully');
        } else {
          Alert.alert('Success', 'Flock deleted successfully');
        }
        
        // Navigate back to flock list
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'FlockList' }],
          });
        }, 100);
      } else {
        console.log('Delete failed with success=false');
        if (Platform.OS === 'web') {
          window.alert('Failed to delete flock. Please try again.');
        } else {
          Alert.alert('Error', 'Failed to delete flock. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error deleting flock:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete flock';
      
      if (Platform.OS === 'web') {
        window.alert(`Error: ${errorMessage}`);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setDeleting(false);
      console.log('Delete process completed');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
    >
      <View style={{maxWidth: 800, width: '100%', alignSelf: 'center', padding: 20}}>
        {/* Header */}
        <TouchableOpacity
          style={{marginBottom: 20}}
          onPress={() => navigation.goBack()}
        >
          <Text style={{color: colors.primary, fontSize: 16}}>← Back to Flocks</Text>
        </TouchableOpacity>

        {/* Flock Info Card */}
        <View style={{backgroundColor: colors.primary, borderRadius: BORDER_RADIUS.lg, padding: 24, marginBottom: 20, ...SHADOWS.md}}>
          <Text style={{fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16}}>
            🐔 {flock.name}
          </Text>
          
          {/* Main Stats Grid */}
          <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 20, marginBottom: 16}}>
            <View>
              <Text style={{color: 'rgba(255,255,255,0.8)', fontSize: 13}}>Breed</Text>
              <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>{flock.breed}</Text>
            </View>
            <View>
              <Text style={{color: 'rgba(255,255,255,0.8)', fontSize: 13}}>Count</Text>
              <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>{flock.currentCount} birds</Text>
            </View>
            <View>
              <Text style={{color: 'rgba(255,255,255,0.8)', fontSize: 13}}>Age</Text>
              <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>{flock.ageInWeeks} weeks ({flock.ageInDays || flock.ageInWeeks * 7} days)</Text>
            </View>
            <View>
              <Text style={{color: 'rgba(255,255,255,0.8)', fontSize: 13}}>Stage</Text>
              <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>{flock.growthStage}</Text>
            </View>
          </View>

          {/* Additional Details */}
          <View style={{paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', marginBottom: 16}}>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 16}}>
              <View>
                <Text style={{color: 'rgba(255,255,255,0.8)', fontSize: 13}}>Initial Count</Text>
                <Text style={{color: '#fff', fontSize: 14}}>{flock.initialCount} birds</Text>
              </View>
              <View>
                <Text style={{color: 'rgba(255,255,255,0.8)', fontSize: 13}}>Created</Text>
                <Text style={{color: '#fff', fontSize: 14}}>{new Date(flock.createdAt).toLocaleDateString()}</Text>
              </View>
              {flock.totalPredictions > 0 && (
                <View>
                  <Text style={{color: 'rgba(255,255,255,0.8)', fontSize: 13}}>Total Predictions</Text>
                  <Text style={{color: '#fff', fontSize: 14}}>{flock.totalPredictions}</Text>
                </View>
              )}
              {flock.lastPredictionDate && (
                <View>
                  <Text style={{color: 'rgba(255,255,255,0.8)', fontSize: 13}}>Last Prediction</Text>
                  <Text style={{color: '#fff', fontSize: 14}}>{new Date(flock.lastPredictionDate).toLocaleDateString()}</Text>
                </View>
              )}
            </View>
          </View>

          {flock.notes && (
            <View style={{paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)'}}>
              <Text style={{color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 4}}>Notes</Text>
              <Text style={{color: '#fff', fontSize: 14}}>{flock.notes}</Text>
            </View>
          )}
        </View>

        {/* Weekly Feed Consumption Tracker */}
        <WeeklyFeedTracker 
          key={refreshKey}
          flockId={flock._id} 
          onDataUpdate={(data) => {
            // Optional: Handle data updates if needed
            console.log('Weekly feed data updated:', data);
          }}
        />

        {/* Action Buttons */}
        <View style={{flexDirection: 'row', gap: 12, marginBottom: 24}}>
          <TouchableOpacity
            style={{flex: 1, paddingVertical: 14, backgroundColor: colors.primary, borderRadius: BORDER_RADIUS.md, alignItems: 'center'}}
            onPress={() => navigation.navigate('GrowthPrediction', { flock })}
          >
            <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 15}}>📊 New Prediction</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{flex: 1, paddingVertical: 14, backgroundColor: '#6366F1', borderRadius: BORDER_RADIUS.md, alignItems: 'center'}}
            onPress={() => navigation.navigate('FlockCreation', { flock })}
          >
            <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 15}}>✏️ Edit Flock</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{minWidth: 50, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#EF4444', borderRadius: BORDER_RADIUS.md, alignItems: 'center', opacity: deleting ? 0.6 : 1}}
            onPress={handleDeleteFlock}
            disabled={deleting}
          >
            <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 15}}>🗑️</Text>
          </TouchableOpacity>
        </View>

        {/* Feed Plans Section */}
        <View style={{marginBottom: 24}}>
          <Text style={{fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16}}>
            🌾 Feed Plans & Nutrition
          </Text>

          {loading ? (
            <View style={{padding: 40, alignItems: 'center', backgroundColor: colors.card, borderRadius: BORDER_RADIUS.lg}}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : feedPlans.length === 0 ? (
            <View style={{backgroundColor: colors.card, borderRadius: BORDER_RADIUS.lg, padding: 30, alignItems: 'center', ...SHADOWS.md}}>
              <Text style={{fontSize: 40, marginBottom: 12}}>🌾</Text>
              <Text style={{fontSize: 16, fontWeight: 'bold', color: colors.textSecondary, marginBottom: 8}}>
                No Feed Plans Yet
              </Text>
              <Text style={{color: colors.textSecondary, textAlign: 'center', fontSize: 14}}>
                Feed plans are generated automatically with predictions
              </Text>
            </View>
          ) : (
            feedPlans.slice(0, 3).map((plan, index) => (
              <View key={index} style={{backgroundColor: colors.card, borderRadius: BORDER_RADIUS.lg, padding: 20, marginBottom: 16, ...SHADOWS.md}}>
                {/* Plan Header */}
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border}}>
                  <View>
                    <Text style={{fontSize: 18, fontWeight: 'bold', color: colors.text}}>
                      Week {plan.weekNumber} - {plan.growthStage} Stage
                    </Text>
                    <Text style={{color: colors.textSecondary, fontSize: 13, marginTop: 4}}>
                      Age: {plan.currentAge} weeks - Weight: {plan.currentWeight}g
                    </Text>
                  </View>
                  <View style={{backgroundColor: '#10B981' + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8}}>
                    <Text style={{color: '#10B981', fontSize: 12, fontWeight: '600'}}>
                      {new Date(plan.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                {/* Nutrition Profile */}
                <View style={{backgroundColor: colors.primary + '15', borderRadius: 12, padding: 16, marginBottom: 16}}>
                  <Text style={{fontWeight: 'bold', color: colors.text, fontSize: 15, marginBottom: 12}}>
                    📊 Nutrition Profile
                  </Text>
                  <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 16}}>
                    <View style={{minWidth: 80}}>
                      <Text style={{color: colors.textSecondary, fontSize: 12}}>Protein</Text>
                      <Text style={{fontWeight: 'bold', color: colors.primary, fontSize: 18}}>
                        {plan.nutritionPlan.protein}%
                      </Text>
                    </View>
                    <View style={{minWidth: 80}}>
                      <Text style={{color: colors.textSecondary, fontSize: 12}}>Energy</Text>
                      <Text style={{fontWeight: 'bold', color: colors.primary, fontSize: 18}}>
                        {plan.nutritionPlan.energy} kcal
                      </Text>
                    </View>
                    <View style={{minWidth: 80}}>
                      <Text style={{color: colors.textSecondary, fontSize: 12}}>Calcium</Text>
                      <Text style={{fontWeight: 'bold', color: colors.primary, fontSize: 18}}>
                        {plan.nutritionPlan.calcium}%
                      </Text>
                    </View>
                    <View style={{minWidth: 80}}>
                      <Text style={{color: colors.textSecondary, fontSize: 12}}>Phosphorus</Text>
                      <Text style={{fontWeight: 'bold', color: colors.primary, fontSize: 18}}>
                        {plan.nutritionPlan.phosphorus}%
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Feed Amounts */}
                <View style={{backgroundColor: '#F59E0B' + '15', borderRadius: 12, padding: 16, marginBottom: 16}}>
                  <Text style={{fontWeight: 'bold', color: colors.text, fontSize: 15, marginBottom: 12}}>
                    📏 Feed Amounts
                  </Text>
                  <View style={{gap: 8}}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                      <Text style={{color: colors.textSecondary, fontSize: 14}}>Daily per bird:</Text>
                      <Text style={{fontWeight: 'bold', color: '#F59E0B', fontSize: 14}}>
                        {plan.dailyFeedPerChicken}g
                      </Text>
                    </View>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                      <Text style={{color: colors.textSecondary, fontSize: 14}}>Weekly per bird:</Text>
                      <Text style={{fontWeight: 'bold', color: '#F59E0B', fontSize: 14}}>
                        {plan.weeklyFeedPerChicken}g
                      </Text>
                    </View>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border}}>
                      <Text style={{color: colors.text, fontSize: 15, fontWeight: '600'}}>Total weekly:</Text>
                      <Text style={{fontWeight: 'bold', color: '#F59E0B', fontSize: 16}}>
                        {(plan.totalWeeklyFeed / 1000).toFixed(2)} kg
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Ingredients */}
                <View style={{backgroundColor: '#8B5CF6' + '15', borderRadius: 12, padding: 16, marginBottom: 16}}>
                  <Text style={{fontWeight: 'bold', color: colors.text, fontSize: 15, marginBottom: 12}}>
                    🥣 Ingredient Mix
                  </Text>
                  <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 12}}>
                    <View style={{backgroundColor: colors.card, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.border}}>
                      <Text style={{color: colors.textSecondary, fontSize: 12}}>Corn</Text>
                      <Text style={{fontWeight: 'bold', color: colors.text, fontSize: 14}}>
                        {plan.ingredients.corn}%
                      </Text>
                    </View>
                    <View style={{backgroundColor: colors.card, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.border}}>
                      <Text style={{color: colors.textSecondary, fontSize: 12}}>Soybean</Text>
                      <Text style={{fontWeight: 'bold', color: colors.text, fontSize: 14}}>
                        {plan.ingredients.soybeanMeal}%
                      </Text>
                    </View>
                    <View style={{backgroundColor: colors.card, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.border}}>
                      <Text style={{color: colors.textSecondary, fontSize: 12}}>Wheat</Text>
                      <Text style={{fontWeight: 'bold', color: colors.text, fontSize: 14}}>
                        {plan.ingredients.wheat}%
                      </Text>
                    </View>
                    <View style={{backgroundColor: colors.card, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.border}}>
                      <Text style={{color: colors.textSecondary, fontSize: 12}}>Vitamins</Text>
                      <Text style={{fontWeight: 'bold', color: colors.text, fontSize: 14}}>
                        {plan.ingredients.vitamins}%
                      </Text>
                    </View>
                    <View style={{backgroundColor: colors.card, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.border}}>
                      <Text style={{color: colors.textSecondary, fontSize: 12}}>Minerals</Text>
                      <Text style={{fontWeight: 'bold', color: colors.text, fontSize: 14}}>
                        {plan.ingredients.minerals}%
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Recommendations */}
                {plan.recommendations && plan.recommendations.length > 0 && (
                  <View style={{backgroundColor: '#10B981' + '15', borderRadius: 12, padding: 16}}>
                    <Text style={{fontWeight: 'bold', color: colors.text, fontSize: 15, marginBottom: 10}}>
                      💡 Recommendations
                    </Text>
                    {plan.recommendations.map((rec, idx) => (
                      <Text key={idx} style={{color: colors.text, fontSize: 13, marginBottom: 6, lineHeight: 18}}>
                        {rec}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}

          {feedPlans.length > 3 && (
            <Text style={{color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8}}>
              Showing latest 3 of {feedPlans.length} feed plans
            </Text>
          )}
        </View>

        {/* History Section */}
        <View>
          <Text style={{fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16}}>
            📈 Prediction History
          </Text>

          {loading ? (
            <View style={{padding: 40, alignItems: 'center'}}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : predictions.length === 0 ? (
            <View style={{backgroundColor: colors.card, borderRadius: BORDER_RADIUS.lg, padding: 40, alignItems: 'center', ...SHADOWS.md}}>
              <Text style={{fontSize: 48, marginBottom: 12}}>📊</Text>
              <Text style={{fontSize: 18, fontWeight: 'bold', color: colors.textSecondary, marginBottom: 8}}>
                No Predictions Yet
              </Text>
              <Text style={{color: colors.textSecondary, textAlign: 'center', marginBottom: 20}}>
                Create your first growth prediction to start tracking
              </Text>
              <TouchableOpacity
                style={{backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: BORDER_RADIUS.md}}
                onPress={() => navigation.navigate('GrowthPrediction', { flock })}
              >
                <Text style={{color: '#fff', fontWeight: 'bold'}}>Create Prediction</Text>
              </TouchableOpacity>
            </View>
          ) : (
            predictions.map((record, index) => (
              <View key={index} style={{backgroundColor: colors.card, borderRadius: BORDER_RADIUS.lg, padding: 20, marginBottom: 16, ...SHADOWS.md}}>
                {/* Date Header */}
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border}}>
                  <Text style={{fontWeight: 'bold', color: colors.text, fontSize: 16}}>
                    📅 {formatDate(record.createdAt || record.date)}
                  </Text>
                  <View style={{backgroundColor: colors.primary + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8}}>
                    <Text style={{color: colors.primary, fontSize: 12, fontWeight: '600'}}>
                      Week {record.weekNumber || flock.ageInWeeks}
                    </Text>
                  </View>
                </View>

                {/* Prediction Data */}
                {record.prediction && (
                  <View style={{marginBottom: 16}}>
                    <Text style={{fontWeight: 'bold', color: colors.text, fontSize: 15, marginBottom: 8}}>
                      Weight Prediction
                    </Text>
                    <View style={{flexDirection: 'row', gap: 20}}>
                      {record.prediction.actualWeight && (
                        <View>
                          <Text style={{color: colors.textSecondary, fontSize: 13}}>Actual</Text>
                          <Text style={{fontWeight: 'bold', color: colors.primary, fontSize: 20}}>
                            {record.prediction.actualWeight}g
                          </Text>
                        </View>
                      )}
                      {record.prediction.predictedWeight && (
                        <View>
                          <Text style={{color: colors.textSecondary, fontSize: 13}}>Predicted</Text>
                          <Text style={{fontWeight: 'bold', color: '#3B82F6', fontSize: 20}}>
                            {record.prediction.predictedWeight}g
                          </Text>
                        </View>
                      )}
                    </View>
                    {record.feedType && (
                      <Text style={{color: colors.textSecondary, fontSize: 14, marginTop: 8}}>
                        🌾 Feed: {record.feedType}
                      </Text>
                    )}
                  </View>
                )}

                {/* Feed Plan */}
                {record.feedPlan && (
                  <View style={{backgroundColor: colors.primary + '20', padding: 16, borderRadius: 12, marginTop: 12}}>
                    <Text style={{fontWeight: 'bold', color: colors.primary, fontSize: 15, marginBottom: 12}}>
                      🌾 Feed Plan
                    </Text>
                    {record.feedPlan.dailyFeedPerBird && (
                      <Text style={{color: colors.text, fontSize: 14, marginBottom: 4}}>
                        Daily per bird: {record.feedPlan.dailyFeedPerBird}g
                      </Text>
                    )}
                    {record.feedPlan.totalDailyFeed && (
                      <Text style={{color: colors.text, fontSize: 14, marginBottom: 4}}>
                        Total daily: {record.feedPlan.totalDailyFeed}kg
                      </Text>
                    )}
                    {record.feedPlan.weeklyTotal && (
                      <Text style={{color: colors.text, fontSize: 14}}>
                        Weekly total: {record.feedPlan.weeklyTotal}kg
                      </Text>
                    )}
                  </View>
                )}

                {/* Recommendations */}
                {record.recommendations && record.recommendations.length > 0 && (
                  <View style={{marginTop: 16}}>
                    <Text style={{fontWeight: 'bold', color: colors.text, fontSize: 15, marginBottom: 8}}>
                      💡 Recommendations
                    </Text>
                    {record.recommendations.map((rec, idx) => (
                      <Text key={idx} style={{color: colors.textSecondary, fontSize: 14, marginBottom: 4}}>
                        {rec}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default FlockDetailScreen;
