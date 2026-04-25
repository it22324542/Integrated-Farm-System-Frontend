import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { API_URL } from '../config/api';

const FeedOptimizationScreen = ({ route, navigation }) => {
  const { flockId, dailyRecords } = route.params;
  
  const [feedPlan, setFeedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flockData, setFlockData] = useState(null);

  useEffect(() => {
    generateFeedPlan();
  }, []);

  const generateFeedPlan = async () => {
    try {
      setLoading(true);

      // Fetch flock data
      const flockResponse = await fetch(`${API_URL}/predictions/daily-analysis/${flockId}`);
      const flockResult = await flockResponse.json();

      if (flockResult.success) {
        setFlockData(flockResult.data.flockDetails);
        
        // Calculate feed plan based on 7-day analysis
        const records = flockResult.data.dailyAnalysisRecords;
        const plan = calculateFeedPlan(flockResult.data.flockDetails, records);
        setFeedPlan(plan);
      }
    } catch (error) {
      console.error('Feed plan generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFeedPlan = (flock, records) => {
    // Calculate average consumption over 7 days
    const totalConsumption = records.reduce((sum, record) => 
      sum + record.currentDayFeedConsumption, 0
    );
    const avgConsumption = totalConsumption / records.length;

    // Calculate average weight
    const weightsWithActual = records.filter(r => r.actualWeight);
    const avgActualWeight = weightsWithActual.length > 0
      ? weightsWithActual.reduce((sum, r) => sum + r.actualWeight, 0) / weightsWithActual.length
      : null;

    const avgPredictedWeight = records.reduce((sum, r) => sum + r.predictedWeight, 0) / records.length;
    const currentWeight = avgActualWeight || avgPredictedWeight;

    // Determine growth stage
    let growthStage = 'Starter';
    let protein = 20;
    let energy = 3000;
    let calcium = 1.0;
    let phosphorus = 0.5;
    let dailyFeedPerBird = 50;

    const age = flock.ageInWeeks;
    if (age <= 6) {
      growthStage = 'Starter';
      protein = 20;
      energy = 3000;
      dailyFeedPerBird = 50 + (age * 10); // 50-110g
    } else if (age <= 18) {
      growthStage = 'Grower';
      protein = 16;
      energy = 2900;
      dailyFeedPerBird = 110 + ((age - 6) * 5); // 110-170g
    } else {
      growthStage = 'Layer';
      protein = 18;
      energy = 2800;
      calcium = 3.5;
      dailyFeedPerBird = 120;
    }

    // Adjust based on consumption patterns
    let feedStatus = 'Optimal';
    let recommendations = [];

    if (avgConsumption < 50) {
      feedStatus = 'Low Consumption';
      recommendations.push('⚠️ Low feed consumption detected. Check for health issues or feed quality.');
      recommendations.push('🌡️ Ensure adequate water supply and comfortable temperature.');
      dailyFeedPerBird *= 1.1; // Increase by 10%
    } else if (avgConsumption >= 75) {
      feedStatus = 'High Consumption';
      recommendations.push('✅ Excellent feed consumption! Birds are eating well.');
      recommendations.push('📈 Continue current feeding schedule.');
    } else {
      feedStatus = 'Moderate';
      recommendations.push ('✓ Moderate feed consumption. Monitor closely.');
      recommendations.push('🔍 Consider gradually increasing feed if weight targets not met.');
    }

    // Weight-based recommendations
    if (avgActualWeight && avgPredictedWeight) {
      const weightRatio = avgActualWeight / avgPredictedWeight;
      if (weightRatio < 0.9) {
        recommendations.push('⚡ Birds are underweight. Increase protein content and feeding frequency.');
        dailyFeedPerBird *= 1.15; // Increase by 15%
        protein += 2;
      } else if (weightRatio > 1.1) {
        recommendations.push('🎯 Birds are overweight for age. Monitor portion sizes.');
        dailyFeedPerBird *= 0.95; // Reduce by 5%
      } else {
        recommendations.push('💯 Weight is optimal for age!');
      }
    }

    const weeklyFeedPerBird = dailyFeedPerBird * 7;
    const totalWeeklyFeed = (weeklyFeedPerBird * flock.currentCount) / 1000; // Convert to kg

    // Feed type recommendations
    let feedTypes = [];
    if (growthStage === 'Starter') {
      feedTypes = ['Chick Starter Crumbles', 'High Protein Starter Mash'];
    } else if (growthStage === 'Grower') {
      feedTypes = ['Grower Pellets', 'Developer Feed'];
    } else {
      feedTypes = ['Layer Pellets', 'Layer Mash with Calcium'];
    }

    return {
      growthStage,
      feedStatus,
      avgConsumption: avgConsumption.toFixed(1),
      avgWeight: currentWeight.toFixed(0),
      nutrition: {
        protein,
        energy,
        calcium,
        phosphorus
      },
      feeding: {
        dailyPerBird: dailyFeedPerBird.toFixed(0),
        weeklyPerBird: weeklyFeedPerBird.toFixed(0),
        totalWeekly: totalWeeklyFeed.toFixed(2)
      },
      recommendations,
      feedTypes,
      nextWeekPrediction: {
        expectedWeight: (currentWeight * 1.08).toFixed(0), // 8% weekly growth
        expectedConsumption: Math.min(100, avgConsumption + 10)
      }
    };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Generating optimized feed plan...</Text>
      </View>
    );
  }

  if (!feedPlan || !flockData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Unable to generate feed plan</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={generateFeedPlan}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌾 Optimized Feed Plan</Text>
        <Text style={styles.headerSubtitle}>
          Based on 7-Day Analysis for {flockData.name}
        </Text>
      </View>

      {/* Flock Summary Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Flock Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Breed</Text>
            <Text style={styles.summaryValue}>{flockData.breed}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Age</Text>
            <Text style={styles.summaryValue}>{flockData.ageInWeeks} weeks</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Count</Text>
            <Text style={styles.summaryValue}>{flockData.currentCount} birds</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Stage</Text>
            <Text style={styles.summaryValue}>{feedPlan.growthStage}</Text>
          </View>
        </View>
      </View>

      {/* Feed Status */}
      <View style={[styles.card, styles.statusCard]}>
        <Text style={styles.statusTitle}>📊 7-Day Analysis Results</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Average Consumption:</Text>
          <Text style={styles.statusValue}>{feedPlan.avgConsumption}%</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Average Weight:</Text>
          <Text style={styles.statusValue}>{feedPlan.avgWeight}g</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Feed Status:</Text>
          <Text style={[
            styles.statusValue,
            feedPlan.feedStatus === 'Optimal' ? styles.goodStatus :
            feedPlan.feedStatus === 'High Consumption' ? styles.excellentStatus :
            styles.warningStatus
          ]}>
            {feedPlan.feedStatus}
          </Text>
        </View>
      </View>

      {/* Nutrition Requirements */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🥗 Nutrition Requirements</Text>
        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{feedPlan.nutrition.protein}%</Text>
            <Text style={styles.nutritionLabel}>Protein</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{feedPlan.nutrition.energy}</Text>
            <Text style={styles.nutritionLabel}>Energy (kcal/kg)</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{feedPlan.nutrition.calcium}%</Text>
            <Text style={styles.nutritionLabel}>Calcium</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{feedPlan.nutrition.phosphorus}%</Text>
            <Text style={styles.nutritionLabel}>Phosphorus</Text>
          </View>
        </View>
      </View>

      {/* Feed Quantity */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚖️ Recommended Feed Quantity</Text>
        <View style={styles.feedDetail}>
          <Text style={styles.feedLabel}>Per Bird (Daily):</Text>
          <Text style={styles.feedValue}>{feedPlan.feeding.dailyPerBird}g</Text>
        </View>
        <View style={styles.feedDetail}>
          <Text style={styles.feedLabel}>Per Bird (Weekly):</Text>
          <Text style={styles.feedValue}>{feedPlan.feeding.weeklyPerBird}g</Text>
        </View>
        <View style={[styles.feedDetail, styles.totalFeedSection]}>
          <Text style={styles.totalFeedLabel}>Total Weekly Feed Needed:</Text>
          <Text style={styles.totalFeedValue}>{feedPlan.feeding.totalWeekly} kg</Text>
        </View>
      </View>

      {/* Feed Type Recommendations */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌾 Recommended Feed Types</Text>
        {feedPlan.feedTypes.map((type, index) => (
          <View key={index} style={styles.feedTypeItem}>
            <Text style={styles.feedTypeBullet}>•</Text>
            <Text style={styles.feedTypeText}>{type}</Text>
          </View>
        ))}
      </View>

      {/* Recommendations */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💡 Recommendations & Insights</Text>
        {feedPlan.recommendations.map((rec, index) => (
          <View key={index} style={styles.recommendationItem}>
            <Text style={styles.recommendationText}>{rec}</Text>
          </View>
        ))}
      </View>

      {/* Next Week Prediction */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔮 Next Week Predictions</Text>
        <View style={styles.predictionRow}>
          <Text style={styles.predictionLabel}>Expected Weight:</Text>
          <Text style={styles.predictionValue}>{feedPlan.nextWeekPrediction.expectedWeight}g</Text>
        </View>
        <View style={styles.predictionRow}>
          <Text style={styles.predictionLabel}>Expected Consumption:</Text>
          <Text style={styles.predictionValue}>{feedPlan.nextWeekPrediction.expectedConsumption}%</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={() => navigation.navigate('FlockProfile', { flockId })}
      >
        <Text style={styles.primaryButtonText}>
          ✓ Return to Flock Profile
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('FlockList')}
      >
        <Text style={styles.secondaryButtonText}>
          ← Back to All Flocks
        </Text>
      </TouchableOpacity>

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
  errorText: {
    fontSize: 16,
    color: '#f44336',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 25,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e0e0e0',
    marginTop: 5,
  },
  card: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    marginBottom: 15,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusCard: {
    backgroundColor: '#f8f8f8',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 15,
    color: '#666',
  },
  statusValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  goodStatus: {
    color: '#4CAF50',
  },
  excellentStatus: {
    color: '#2196F3',
  },
  warningStatus: {
    color: '#FF9800',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  feedDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  feedLabel: {
    fontSize: 15,
    color: '#666',
  },
  feedValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  totalFeedSection: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#4CAF50',
    borderBottomWidth: 0,
  },
  totalFeedLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalFeedValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  feedTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  feedTypeBullet: {
    fontSize: 20,
    color: '#4CAF50',
    marginRight: 10,
  },
  feedTypeText: {
    fontSize: 15,
    color: '#333',
  },
  recommendationItem: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  predictionLabel: {
    fontSize: 15,
    color: '#666',
  },
  predictionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    margin: 15,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#2196F3',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FeedOptimizationScreen;
