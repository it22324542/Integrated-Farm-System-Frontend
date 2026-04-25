import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { API_URL } from '../config/apiConfig';
import { useTheme } from '../context/ThemeContext';

const screenWidth = Dimensions.get('window').width;
const isWeb = Platform.OS === 'web';

const InitialFeedPlanScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { flock } = route.params;
  const [loading, setLoading] = useState(false);
  const [feedPlan, setFeedPlan] = useState(null);

  useEffect(() => {
    generateInitialFeedPlan();
  }, []);

  const generateInitialFeedPlan = async () => {
    try {
      setLoading(true);
      
      console.log('🎯 Generating initial feed plan for flock:', flock._id);
      
      const response = await fetch(`${API_URL}/predictions/initial-feed-plan/${flock._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      console.log('✅ Feed Plan Response:', JSON.stringify(data.data, null, 2));
      
      if (data.success) {
        setFeedPlan(data.data);
        console.log('📊 Nutrition Details:', data.data.nutritionDetails);
        console.log('🌽 Feed Ingredients:', data.data.feedIngredients);
      } else {
        Alert.alert('Error', data.error || 'Failed to generate feed plan');
      }
    } catch (error) {
      console.error('Error generating feed plan:', error);
      Alert.alert('Error', 'Failed to generate feed plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndGoToProfile = () => {
    navigation.navigate('FlockDetail', { 
      flockId: flock._id,
      flockData: flock 
    });
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Generating your feed plan...</Text>
      </View>
    );
  }

  if (!feedPlan) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={styles.errorText}>Failed to generate feed plan</Text>
        <TouchableOpacity style={styles.retryButton} onPress={generateInitialFeedPlan}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎯 Initial Feed Plan</Text>
        <Text style={styles.headerSubtitle}>For {flock.name}</Text>
      </View>

      <View style={[styles.flockInfoCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>📊 Flock Details</Text>
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Breed:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{flock.breed}</Text>
        </View>
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Age:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{flock.ageInWeeks} weeks</Text>
        </View>
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Count:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{flock.currentCount || flock.initialCount} birds</Text>
        </View>
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Stage:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{feedPlan.growthStage}</Text>
        </View>
      </View>

      <View style={[styles.feedPlanCard, { backgroundColor: colors.card, borderLeftColor: colors.primary }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>🌾 Recommended Feed Plan</Text>
        
        <View style={[styles.predictionBox, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
          <Text style={styles.predictionLabel}>Expected Weight (Week {Math.floor(flock.ageInWeeks)})</Text>
          <Text style={styles.predictionValue}>{feedPlan.predictedWeight}g</Text>
        </View>

        {/* Nutrition Details - ALWAYS VISIBLE WITH ALL 8 METRICS */}
        {feedPlan.nutritionDetails && (
          <View style={[styles.nutritionCard, { backgroundColor: colors.card, borderWidth: 2, borderColor: '#10B981' }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 18, marginBottom: 16 }]}>📊 Complete Nutrition Analysis (8 Metrics)</Text>
            <View style={styles.nutritionGrid}>
              <View style={[styles.nutritionItem, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                <Text style={[styles.nutritionLabel, { color: colors.textSecondary, fontWeight: 'bold', fontSize: 11 }]}>CRUDE PROTEIN</Text>
                <Text style={[styles.nutritionValue, { fontSize: 18 }]}>{feedPlan.nutritionDetails.crudeProtein}%</Text>
              </View>
              <View style={[styles.nutritionItem, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                <Text style={[styles.nutritionLabel, { color: colors.textSecondary, fontWeight: 'bold', fontSize: 11 }]}>ENERGY</Text>
                <Text style={[styles.nutritionValue, { fontSize: 18 }]}>{feedPlan.nutritionDetails.metabolizableEnergy} kcal/kg</Text>
              </View>
              <View style={[styles.nutritionItem, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                <Text style={[styles.nutritionLabel, { color: colors.textSecondary, fontWeight: 'bold', fontSize: 11 }]}>CALCIUM</Text>
                <Text style={[styles.nutritionValue, { fontSize: 18 }]}>{feedPlan.nutritionDetails.calcium}%</Text>
              </View>
              <View style={[styles.nutritionItem, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                <Text style={[styles.nutritionLabel, { color: colors.textSecondary, fontWeight: 'bold', fontSize: 11 }]}>PHOSPHORUS</Text>
                <Text style={[styles.nutritionValue, { fontSize: 18 }]}>{feedPlan.nutritionDetails.phosphorus}%</Text>
              </View>
              <View style={[styles.nutritionItem, { backgroundColor: 'rgba(59, 130, 246, 0.18)' }]}>
                <Text style={[styles.nutritionLabel, { color: colors.textSecondary, fontWeight: 'bold', fontSize: 11 }]}>LYSINE</Text>
                <Text style={[styles.nutritionValue, { fontSize: 18, color: '#3B82F6' }]}>{feedPlan.nutritionDetails.lysine}%</Text>
              </View>
              <View style={[styles.nutritionItem, { backgroundColor: 'rgba(59, 130, 246, 0.18)' }]}>
                <Text style={[styles.nutritionLabel, { color: colors.textSecondary, fontWeight: 'bold', fontSize: 11 }]}>METHIONINE</Text>
                <Text style={[styles.nutritionValue, { fontSize: 18, color: '#3B82F6' }]}>{feedPlan.nutritionDetails.methionine}%</Text>
              </View>
              <View style={[styles.nutritionItem, { backgroundColor: 'rgba(245, 158, 11, 0.18)' }]}>
                <Text style={[styles.nutritionLabel, { color: colors.textSecondary, fontWeight: 'bold', fontSize: 11 }]}>FIBER</Text>
                <Text style={[styles.nutritionValue, { fontSize: 18, color: '#F59E0B' }]}>{feedPlan.nutritionDetails.fiber}%</Text>
              </View>
              <View style={[styles.nutritionItem, { backgroundColor: 'rgba(245, 158, 11, 0.18)' }]}>
                <Text style={[styles.nutritionLabel, { color: colors.textSecondary, fontWeight: 'bold', fontSize: 11 }]}>FAT</Text>
                <Text style={[styles.nutritionValue, { fontSize: 18, color: '#F59E0B' }]}>{feedPlan.nutritionDetails.fat}%</Text>
              </View>
            </View>
          </View>
        )}

        {/* Feed Ingredients - ALWAYS VISIBLE */}
        {feedPlan.feedIngredients && feedPlan.feedIngredients.length > 0 && (
          <View style={[styles.ingredientsCard, { backgroundColor: colors.card, borderWidth: 2, borderColor: '#F59E0B' }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 18, marginBottom: 16 }]}>🌽 Complete Feed Composition ({feedPlan.feedIngredients.length} Ingredients)</Text>
            {feedPlan.feedIngredients.map((ingredient, index) => (
              <View key={index} style={[styles.ingredientRow, { backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: 12, borderRadius: 8, marginBottom: 8 }]}>
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

        <View style={[styles.recommendationBox, { backgroundColor: 'rgba(255, 193, 7, 0.2)' }]}>
          <Text style={styles.recommendationTitle}>📋 Feeding Recommendations</Text>
          <Text style={[styles.recommendationText, { color: colors.text }]}>{feedPlan.recommendation}</Text>
        </View>

        <View style={[styles.feedTypeBox, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
          <Text style={[styles.feedTypeLabel, { color: '#8B5CF6' }]}>Recommended Feed Type:</Text>
          <Text style={[styles.feedTypeValue, { color: '#7C3AED' }]}>{feedPlan.recommendedFeedType}</Text>
        </View>
      </View>

      <View style={[styles.instructionCard, { backgroundColor: colors.card, borderLeftColor: colors.primary }]}>
        <Text style={[styles.instructionTitle, { color: colors.primary }]}>📱 Next Steps</Text>
        <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
          1. Save this feed plan to your flock profile{'\n'}
          2. Start monitoring daily feed consumption{'\n'}
          3. Upload 7 daily feed images throughout the week{'\n'}
          4. Analyze weekly performance and adjust plan if needed
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.saveButton}
        onPress={handleSaveAndGoToProfile}
      >
        <Text style={styles.saveButtonText}>💾 Save & Go to Profile</Text>
      </TouchableOpacity>

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
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#10B981',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
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
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  instructionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  predictionBox: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  predictionLabel: {
    fontSize: 14,
    color: '#10B981',
    marginBottom: 4,
  },
  predictionValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
  },
  recommendationBox: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  feedTypeBox: {
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedTypeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  feedTypeValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  saveButton: {
    backgroundColor: '#10B981',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  nutritionCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 12,
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
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
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
    color: '#10B981',
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

export default InitialFeedPlanScreen;
