import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import axios from 'axios';
import { API_URL } from '../config/apiConfig';
import { useTheme } from '../context/ThemeContext';
import { TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const FeedOptimizationScreen = ({ route, navigation }) => {
  const { flock, prediction } = route.params;
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const [feedPlan, setFeedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nextWeekWeight, setNextWeekWeight] = useState(null);

  useEffect(() => {
    generateFeedPlan();
  }, []);

  const generateFeedPlan = async () => {
    setLoading(true);

    try {
      const actualWeight = prediction?.prediction?.actualWeight;
      const predictedWeight = prediction?.prediction?.predictedWeight;
      
      const response = await axios.post(`${API_URL}/feed-plans/generate`, {
        flockId: flock._id,
        actualWeight: actualWeight,
        predictedWeight: predictedWeight,
        currentWeight: actualWeight || predictedWeight
      });

      if (response.data.success) {
        setFeedPlan(response.data.data);
        // Calculate next week's predicted weight with adjusted growth
        predictNextWeekWeight(response.data.data, actualWeight, predictedWeight);
      }
    } catch (error) {
      console.error('Feed plan error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to generate feed plan'
      );
    } finally {
      setLoading(false);
    }
  };

  const predictNextWeekWeight = async (feedPlanData, actualWeight, predictedWeight) => {
    try {
      const currentWeight = parseFloat(actualWeight || predictedWeight || 0);
      const currentAge = parseInt(flock.ageInWeeks || 0);
      
      if (!currentWeight || currentWeight <= 0) {
        // If no current weight, use fallback calculation
        throw new Error('No valid current weight');
      }
      
      // Adjust growth rate based on weight status
      let growthRate = 0.08; // Default 8% weekly growth
      
      if (actualWeight && predictedWeight) {
        const weightRatio = actualWeight / predictedWeight;
        
        if (weightRatio > 1.15) {
          // Overweight - reduce growth rate with adjusted feed
          growthRate = 0.05; // 5% growth to maintain/reduce slowly
        } else if (weightRatio < 0.85) {
          // Underweight - increase growth rate with more feed
          growthRate = 0.10; // 10% growth to catch up
        }
      }
      
      // Calculate estimate based on adjusted growth rate
      const estimatedGrowth = currentWeight * growthRate;
      const estimatedWeight = currentWeight + estimatedGrowth;
      setNextWeekWeight(Math.round(estimatedWeight));
      
    } catch (error) {
      console.error('Next week weight prediction error:', error);
      // Set a fallback weight based on age if everything fails
      const currentAge = parseInt(flock.ageInWeeks || 1);
      const fallbackWeight = currentAge * 150; // Rough estimate: 150g per week
      setNextWeekWeight(fallbackWeight);
    }
  };

  const viewHistory = () => {
    navigation.navigate('FlockDetail', { flockId: flock._id, flockData: flock });
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Generating feed plan...</Text>
      </View>
    );
  }

  if (!feedPlan) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>No feed plan available</Text>
      </View>
    );
  }

  const { plan } = feedPlan;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{maxWidth: 800, width: '100%', alignSelf: 'center', padding: 20, paddingBottom: 100}}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🌾 Feed Optimization</Text>
        <Text style={styles.subtitle}>Step 3: Your personalized feed plan</Text>
      </View>

      {/* Flock Summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{flock.name}</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Age</Text>
            <Text style={styles.summaryValue}>{flock.ageInWeeks} weeks</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Count</Text>
            <Text style={styles.summaryValue}>{flock.currentCount}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Stage</Text>
            <Text style={styles.summaryValue}>{plan.growthStage}</Text>
          </View>
        </View>
      </View>

      {/* Growth Stage Info */}
      <View style={[styles.card, styles.stageCard]}>
        <Text style={styles.stageTitle}>{plan.growthStage} Stage</Text>
        <Text style={styles.stageWeek}>Week {plan.weekNumber}</Text>
        <Text style={styles.stageDescription}>
          {plan.growthStage === 'Starter' &&
            'Focus on rapid growth with high protein feed (20%)'}
          {plan.growthStage === 'Grower' &&
            'Sustained growth period with balanced nutrition (16% protein)'}
          {plan.growthStage === 'Layer' &&
            'Egg production phase with high calcium (3.5%) and 18% protein'}
        </Text>
      </View>

      {/* Nutrition Requirements */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Nutrition Requirements</Text>
        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{plan.nutritionPlan.protein}%</Text>
            <Text style={styles.nutritionLabel}>Protein</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{plan.nutritionPlan.energy}</Text>
            <Text style={styles.nutritionLabel}>Energy (kcal/kg)</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{plan.nutritionPlan.calcium}%</Text>
            <Text style={styles.nutritionLabel}>Calcium</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{plan.nutritionPlan.phosphorus}%</Text>
            <Text style={styles.nutritionLabel}>Phosphorus</Text>
          </View>
        </View>
      </View>

      {/* Feed Quantity */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚖️ Feed Quantity</Text>
        <View style={styles.feedRow}>
          <Text style={styles.feedLabel}>Per Chicken (Daily):</Text>
          <Text style={styles.feedValue}>{plan.feedingDetails.dailyPerChicken}</Text>
        </View>
        <View style={styles.feedRow}>
          <Text style={styles.feedLabel}>Per Chicken (Weekly):</Text>
          <Text style={styles.feedValue}>{plan.feedingDetails.weeklyPerChicken}</Text>
        </View>
        <View style={[styles.feedRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Feed (Weekly):</Text>
          <Text style={styles.totalValue}>{plan.feedingDetails.totalWeeklyFeed}</Text>
        </View>
      </View>

      {/* Feed Composition */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌽 Feed Composition</Text>
        <View style={styles.ingredientsList}>
          <View style={styles.ingredientRow}>
            <View style={[styles.ingredientBar, { width: plan.ingredients.corn }]} />
            <Text style={styles.ingredientLabel}>Corn</Text>
            <Text style={styles.ingredientValue}>{plan.ingredients.corn}</Text>
          </View>
          <View style={styles.ingredientRow}>
            <View style={[styles.ingredientBar, { width: plan.ingredients.soybeanMeal, backgroundColor: '#8BC34A' }]} />
            <Text style={styles.ingredientLabel}>Soybean Meal</Text>
            <Text style={styles.ingredientValue}>{plan.ingredients.soybeanMeal}</Text>
          </View>
          <View style={styles.ingredientRow}>
            <View style={[styles.ingredientBar, { width: plan.ingredients.wheat, backgroundColor: '#FFC107' }]} />
            <Text style={styles.ingredientLabel}>Wheat</Text>
            <Text style={styles.ingredientValue}>{plan.ingredients.wheat}</Text>
          </View>
          <View style={styles.ingredientRow}>
            <View style={[styles.ingredientBar, { width: plan.ingredients.vitamins, backgroundColor: '#FF5722' }]} />
            <Text style={styles.ingredientLabel}>Vitamins</Text>
            <Text style={styles.ingredientValue}>{plan.ingredients.vitamins}</Text>
          </View>
          <View style={styles.ingredientRow}>
            <View style={[styles.ingredientBar, { width: plan.ingredients.minerals, backgroundColor: '#607D8B' }]} />
            <Text style={styles.ingredientLabel}>Minerals</Text>
            <Text style={styles.ingredientValue}>{plan.ingredients.minerals}</Text>
          </View>
        </View>
      </View>

      {/* Next Week Weight Prediction */}
      <View style={[styles.card, {backgroundColor: '#FEF3C7', borderWidth: 2, borderColor: '#F59E0B'}]}>
        <Text style={[styles.cardTitle, {color: '#92400E'}]}>📈 Next Week Prediction</Text>
        <View style={{alignItems: 'center', paddingVertical: 16}}>
          <Text style={{fontSize: 14, color: '#78350F', marginBottom: 8}}>
            Expected Weight (Week {flock.ageInWeeks + 1})
          </Text>
          <Text style={{fontSize: 36, fontWeight: '800', color: '#F59E0B', marginBottom: 8}}>
            {nextWeekWeight ? `${nextWeekWeight}g` : 'Calculating...'}
          </Text>
          <Text style={{fontSize: 13, color: '#92400E', textAlign: 'center', paddingHorizontal: 20}}>
            Based on the recommended feed plan and average 8% weekly growth rate, your chickens are expected to reach this weight by next week.
          </Text>
        </View>
      </View>

      {/* Recommendations */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💡 Recommendations</Text>
        {plan.recommendations.map((recommendation, index) => (
          <View key={index} style={styles.recommendationItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.recommendationText}>{recommendation}</Text>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.historyButton]}
          onPress={viewHistory}
        >
          <Text style={styles.buttonText}>📋 View History</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.newPredictionButton]}
          onPress={() => navigation.navigate('GrowthPrediction', { flock })}
        >
          <Text style={styles.buttonText}>🔄 New Prediction</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Next update recommended in 1 week
        </Text>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.navigate('FlockList')}
        >
          <Text style={styles.doneButtonText}>✓ Done</Text>
        </TouchableOpacity>
      </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  card: {
    margin: 12,
    marginBottom: 12,
    padding: 18,
    backgroundColor: colors.card,
    borderRadius: 12,
    ...SHADOWS.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  stageCard: {
    backgroundColor: colors.primary + '20',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  stageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  stageWeek: {
    fontSize: 16,
    color: colors.primary,
    marginTop: 4,
  },
  stageDescription: {
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
    lineHeight: 20,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  nutritionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  feedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  feedLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  feedValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  ingredientsList: {
    marginTop: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ingredientBar: {
    height: 24,
    backgroundColor: colors.primary,
    borderRadius: 4,
    marginRight: 12,
  },
  ingredientLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  ingredientValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    minWidth: 40,
    textAlign: 'right',
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    color: colors.primary,
    marginRight: 8,
    fontWeight: 'bold',
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 8,
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  historyButton: {
    backgroundColor: '#2196F3',
  },
  newPredictionButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FeedOptimizationScreen;
