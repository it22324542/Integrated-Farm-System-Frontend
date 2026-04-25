import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config/apiConfig';

const screenWidth = Dimensions.get('window').width;
const isWeb = Platform.OS === 'web';

const WeeklyAnalysisScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { flockId, weekNumber, weeklyTracking } = route.params;
  const [generating, setGenerating] = useState(false);
  const [autoGenerating, setAutoGenerating] = useState(false);

  const { dailyRecords, overallAnalysis } = weeklyTracking || {};
  const averageConsumption = overallAnalysis?.averageConsumption || 0;

  // Calculate insights
  const goodDays = dailyRecords?.filter(r => r.status === 'good').length || 0;
  const badDays = dailyRecords?.filter(r => r.status === 'bad').length || 0;

  const shouldGenerateNewPlan = averageConsumption < 50; // Less than 50% average

  // Automatically generate new feed plan on mount if needed
  useEffect(() => {
    if (shouldGenerateNewPlan) {
      autoGenerateNewPlan();
    }
  }, []);

  const autoGenerateNewPlan = async () => {
    try {
      setAutoGenerating(true);
      console.log('🤖 Auto-generating new feed plan based on low consumption...');
      
      const response = await fetch(`${API_URL}/predictions/generate-next-week-plan/${flockId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekNumber: weekNumber + 1,
          previousWeekAnalysis: overallAnalysis
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ New feed plan generated automatically');
      }
    } catch (error) {
      console.error('Error auto-generating new plan:', error);
    } finally {
      setAutoGenerating(false);
    }
  };

  const handleContinuePlan = async () => {
    Alert.alert(
      'Continue Current Plan',
      'You will continue with the current feed plan for next week. Monitor daily and adjust as needed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            // Just navigate back to profile
            navigation.navigate('FlockDetail', { flockId });
          }
        }
      ]
    );
  };

  const handleGenerateNewPlan = async () => {
    try {
      setGenerating(true);
      
      // Call endpoint to generate new plan
      const response = await fetch(`${API_URL}/predictions/generate-next-week-plan/${flockId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekNumber: weekNumber + 1,
          previousWeekAnalysis: overallAnalysis
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Navigate directly to profile to see the new plan
        navigation.navigate('FlockDetail', { 
          flockId,
          refresh: true 
        });
      } else {
        Alert.alert('Error', data.error || 'Failed to generate new plan');
      }
    } catch (error) {
      console.error('Error generating new plan:', error);
      Alert.alert('Error', 'Failed to generate new plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Prepare chart data
  const chartData = {
    labels: dailyRecords?.map(r => `D${r.dayNumber}`) || [],
    datasets: [{
      data: dailyRecords?.map(r => r.feedConsumedPercentage) || []
    }]
  };

  // Line chart for weekly trend
  const lineChartData = {
    labels: dailyRecords?.map(r => `D${r.dayNumber}`) || [],
    datasets: [{
      data: dailyRecords?.map(r => r.feedConsumedPercentage) || [],
      color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Primary green
      strokeWidth: 3
    }],
    legend: ["Feed Consumption %"]
  };

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: averageConsumption >= 50 ? '#10B981' : '#F59E0B',
    backgroundGradientTo: averageConsumption >= 50 ? '#34D399' : '#FBBF24',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForLabels: {
      fontSize: 12,
      fontWeight: 'bold'
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Auto-Generate Status */}
      <LinearGradient
        colors={averageConsumption >= 50 ? ['#10B981', '#34D399'] : ['#F59E0B', '#FBBF24']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>📊 Week {weekNumber} Analysis</Text>
        <Text style={styles.headerSubtitle}>
          {shouldGenerateNewPlan ? '🤖 New Plan Auto-Generated' : 'Performance Summary'}
        </Text>
        {autoGenerating && (
          <View style={styles.autoGenBadge}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.autoGenText}>Generating new plan...</Text>
          </View>
        )}
      </LinearGradient>

      {/* Overall Performance Card */}
      <View style={[styles.performanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.performanceTitle, { color: colors.textSecondary }]}>Overall Performance</Text>
        <Text style={[
          styles.performanceValue,
          { color: averageConsumption >= 50 ? '#10B981' : '#F59E0B' }
        ]}>
          {averageConsumption}%
        </Text>
        <Text style={[styles.performanceLabel, { color: colors.textSecondary }]}>Average Feed Consumption</Text>
        
        <View style={[
          styles.statusBadge,
          { backgroundColor: averageConsumption >= 50 ? '#10B981' : '#F59E0B' }
        ]}>
          <Text style={styles.statusText}>
            {averageConsumption >= 75 ? '✅ Excellent' : 
             averageConsumption >= 50 ? '✓ Good' : 
             averageConsumption >= 25 ? '⚠️ Needs Attention' : 
             '🚨 Critical'}
          </Text>
        </View>
        
        {shouldGenerateNewPlan && !autoGenerating && (
          <View style={styles.autoGenCompleteBadge}>
            <Text style={styles.autoGenCompleteText}>✅ New feed plan created automatically</Text>
          </View>
        )}
      </View>

      {/* Bar Chart Card - Mobile Only */}
      {dailyRecords && dailyRecords.length > 0 && !isWeb && (
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>📈 Daily Consumption Bar Chart</Text>
          <BarChart
            data={chartData}
            width={screenWidth - 48}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            yAxisSuffix="%"
            yAxisLabel=""
            fromZero
            showValuesOnTopOfBars
            withInnerLines={false}
          />
        </View>
      )}

      {/* Line Chart for Trend - Mobile Only */}
      {dailyRecords && dailyRecords.length > 0 && !isWeb && (
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>📉 Weekly Trend Line Chart</Text>
          <LineChart
            data={lineChartData}
            width={screenWidth - 48}
            height={220}
            chartConfig={{
              ...chartConfig,
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
              labelColor: (opacity = 1) => colors.text,
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#10B981"
              }
            }}
            bezier
            style={styles.chart}
            withInnerLines
            withOuterLines
            withVerticalLines
            withHorizontalLines
            withDots
            withShadow
            withVerticalLabels
            withHorizontalLabels
          />
        </View>
      )}

      {/* Web-Friendly Data Visualization */}
      {dailyRecords && dailyRecords.length > 0 && isWeb && (
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>📊 Daily Consumption Data</Text>
          {dailyRecords.map((record, index) => (
            <View key={index} style={styles.webDataRow}>
              <Text style={[styles.webDataLabel, { color: colors.textSecondary }]}>
                Day {record.dayNumber}
              </Text>
              <View style={styles.webBarContainer}>
                <View style={[styles.webBarBg, { backgroundColor: colors.border }]}>
                  <View 
                    style={[
                      styles.webBarFill, 
                      { 
                        width: `${record.feedConsumedPercentage}%`,
                        backgroundColor: record.status === 'good' ? '#10B981' : '#F59E0B'
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.webDataValue, { color: colors.text }]}>
                  {record.feedConsumedPercentage}%
                </Text>
              </View>
            </View>
          ))}
          <View style={styles.webLegend}>
            <View style={styles.webLegendItem}>
              <View style={[styles.webLegendDot, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.webLegendText, { color: colors.textSecondary }]}>Good (≥50%)</Text>
            </View>
            <View style={styles.webLegendItem}>
              <View style={[styles.webLegendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={[styles.webLegendText, { color: colors.textSecondary }]}>Low (&lt;50%)</Text>
            </View>
          </View>
        </View>
      )}

      {/* Daily Breakdown */}
      <View style={[styles.breakdownCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>7-Day Breakdown</Text>
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownItem}>
            <Text style={[styles.breakdownValue, { color: '#10B981' }]}>{goodDays}</Text>
            <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Good Days</Text>
            <View style={[styles.indicator, { backgroundColor: '#4CAF50' }]} />
          </View>
          <View style={styles.breakdownItem}>
            <Text style={[styles.breakdownValue, { color: '#F59E0B' }]}>{badDays}</Text>
            <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Low Consumption Days</Text>
            <View style={[styles.indicator, { backgroundColor: '#F59E0B' }]} />
          </View>
        </View>
        
        {dailyRecords && dailyRecords.map((record, index) => (
          <View key={index} style={[styles.dailyRow, { borderBottomColor: colors.border }]}>
            <View style={styles.dailyInfo}>
              <Text style={[styles.dailyDay, { color: colors.text }]}>Day {record.dayNumber}</Text>
              {record.date && (
                <Text style={[styles.dailyTimestamp, { color: colors.textTertiary }]}>
                  {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {new Date(record.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              )}
            </View>
            <Text style={[styles.dailyPercent, { color: colors.textSecondary }]}>{record.feedConsumedPercentage}%</Text>
            <View style={[
              styles.dailyStatus,
              { backgroundColor: record.status === 'good' ? '#10B981' : '#F59E0B' }
            ]}>
              <Text style={styles.dailyStatusText}>
                {record.status === 'good' ? 'Good' : 'Low'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Analysis Message */}
      <View style={[styles.messageCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.messageTitle, { color: colors.text }]}>📋 Analysis</Text>
        <Text style={[styles.messageText, { color: colors.textSecondary }]}>{overallAnalysis?.message}</Text>
      </View>

      {/* Recommendations */}
      <View style={[styles.recommendationsCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>💡 Recommendations</Text>
        
        {shouldGenerateNewPlan ? (
          <>
            <Text style={[styles.recommendText, { color: colors.textSecondary }]}>
              ⚠️ Feed consumption is below optimal levels. We recommend generating a new feed plan that:
            </Text>
            <Text style={[styles.recommendBullet, { color: colors.textSecondary }]}>• Adjusts feed types for better palatability</Text>
            <Text style={[styles.recommendBullet, { color: colors.textSecondary }]}>• Increases feeding frequency</Text>
            <Text style={[styles.recommendBullet, { color: colors.textSecondary }]}>• Checks for health issues</Text>
            <Text style={[styles.recommendBullet, { color: colors.textSecondary }]}>• Ensures fresh water availability</Text>
          </>
        ) : (
          <>
            <Text style={[styles.recommendText, { color: colors.textSecondary }]}>
              ✅ Feed consumption is good! Continue with the current plan:
            </Text>
            <Text style={[styles.recommendBullet, { color: colors.textSecondary }]}>• Maintain current feeding schedule</Text>
            <Text style={[styles.recommendBullet, { color: colors.textSecondary }]}>• Monitor daily consumption</Text>
            <Text style={[styles.recommendBullet, { color: colors.textSecondary }]}>• Keep environment comfortable</Text>
            <Text style={[styles.recommendBullet, { color: colors.textSecondary }]}>• Watch for any behavioral changes</Text>
          </>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {shouldGenerateNewPlan ? (
          <>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleGenerateNewPlan}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  🔄 Generate New Feed Plan for Next Week
                </Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleContinuePlan}
              disabled={generating}
            >
              <Text style={styles.secondaryButtonText}>
                Continue Current Plan Anyway
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleContinuePlan}
            >
              <Text style={styles.primaryButtonText}>
                ✅ Continue Current Plan for Next Week
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleGenerateNewPlan}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator color="#2196F3" />
              ) : (
                <Text style={styles.secondaryButtonText}>
                  Generate New Plan Anyway
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.95,
  },
  performanceCard: {
    margin: 16,
    padding: 28,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  performanceTitle: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  performanceValue: {
    fontSize: 56,
    fontWeight: 'bold',
  },
  performanceLabel: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  breakdownCard: {
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
  messageCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  recommendationsCard: {
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
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  breakdownLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  indicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
  dailyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  dailyInfo: {
    flex: 1,
  },
  dailyDay: {
    fontSize: 14,
    fontWeight: '500',
  },
  dailyTimestamp: {
    fontSize: 10,
    marginTop: 2,
  },
  dailyPercent: {
    fontSize: 14,
    marginRight: 12,
  },
  dailyStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dailyStatusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  recommendText: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  recommendBullet: {
    fontSize: 13,
    marginLeft: 8,
    marginBottom: 6,
    lineHeight: 18,
  },
  actionsContainer: {
    marginHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  secondaryButtonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 30,
  },
  autoGenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  autoGenText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  autoGenCompleteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  autoGenCompleteText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  lineChartCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  chartSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  // Web-friendly visualization styles
  webDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  webDataLabel: {
    width: 60,
    fontSize: 13,
    fontWeight: '500',
  },
  webBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  webBarBg: {
    flex: 1,
    height: 28,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 12,
  },
  webBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  webDataValue: {
    width: 50,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  webLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
  },
  webLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  webLegendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  webLegendText: {
    fontSize: 12,
  },
});

export default WeeklyAnalysisScreen;
