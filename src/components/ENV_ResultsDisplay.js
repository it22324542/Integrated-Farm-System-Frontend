/**
 * ENV Results Display Component
 * React Native component for displaying prediction results and recommendations
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

const ENV_ResultsDisplay = ({ results, onNewPrediction }) => {
  if (!results || !results.success) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {results?.message || 'No prediction results available'}
        </Text>
      </View>
    );
  }

  const { summary, details, actions, factorDetails } = results;

  const getStatusColor = (color) => {
    const colorMap = {
      green: '#4CAF50',
      orange: '#FF9800',
      red: '#F44336',
      gray: '#9E9E9E'
    };
    return colorMap[color] || '#9E9E9E';
  };

  const getProductionEmoji = (level) => {
    const emojiMap = {
      good: '🥇',
      Medium: '⚠️',
      bad: '❌'
    };
    return emojiMap[level] || '📊';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Main Prediction Summary */}
      <View style={[styles.card, styles.summaryCard]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Egg Production Forecast</Text>
        </View>
        
        <View style={styles.predictionMain}>
          <Text style={styles.predictionEmoji}>
            {getProductionEmoji(summary.productionLevel)}
          </Text>
          <Text style={styles.predictionValue}>{summary.eggProduction}</Text>
          <Text style={styles.predictionUnit}>eggs</Text>
        </View>

        <View style={[
          styles.badge, 
          { backgroundColor: getStatusColor(summary.statusColor) }
        ]}>
          <Text style={styles.badgeText}>{summary.productionLevel}</Text>
        </View>

        <Text style={styles.confidenceText}>{details.prediction.confidence}</Text>
      </View>

      {/* Environment Status */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Environment Status</Text>
        </View>
        
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(summary.statusColor) }
        ]}>
          <Text style={styles.statusBadgeText}>{summary.environmentStatus}</Text>
        </View>

        <Text style={styles.statusMessage}>{details.environment.message}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{details.environment.critical}</Text>
            <Text style={styles.statLabel}>Critical</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{details.environment.warnings}</Text>
            <Text style={styles.statLabel}>Warnings</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{details.environment.optimal}</Text>
            <Text style={styles.statLabel}>Optimal</Text>
          </View>
        </View>
      </View>

      {/* Priority Actions */}
      {actions && actions.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>⚡ Priority Actions</Text>
          </View>

          {actions.map((action, index) => (
            <View 
              key={index} 
              style={[
                styles.actionItem,
                { borderLeftColor: getStatusColor(action.color) }
              ]}
            >
              <View style={styles.actionHeader}>
                <Text style={[
                  styles.actionPriority,
                  { color: getStatusColor(action.color) }
                ]}>
                  {action.priority}
                </Text>
                <Text style={styles.actionFactor}>{action.factor}</Text>
              </View>
              <Text style={styles.actionText}>{action.action}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Factor Details */}
      {factorDetails && factorDetails.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📊 Factor Analysis</Text>
          </View>

          {factorDetails.map((factor, index) => (
            <View key={index} style={styles.factorItem}>
              <View style={styles.factorHeader}>
                <Text style={styles.factorName}>{factor.name}</Text>
                <View style={[
                  styles.factorBadge,
                  { backgroundColor: getStatusColor(factor.color) }
                ]}>
                  <Text style={styles.factorBadgeText}>{factor.status}</Text>
                </View>
              </View>

              <Text style={styles.factorValue}>{factor.value}</Text>
              
              {factor.message && (
                <Text style={styles.factorMessage}>{factor.message}</Text>
              )}

              {factor.recommendation && (
                <View style={styles.recommendationBox}>
                  <Text style={styles.recommendationText}>
                    💡 {factor.recommendation}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Model Breakdown */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🔬 Model Details</Text>
        </View>

        <View style={styles.modelRow}>
          <Text style={styles.modelLabel}>Detailed Model:</Text>
          <Text style={styles.modelValue}>
            {details.prediction.breakdown.detailedModel} eggs
          </Text>
        </View>

        <View style={styles.modelRow}>
          <Text style={styles.modelLabel}>Index Model:</Text>
          <Text style={styles.modelValue}>
            {details.prediction.breakdown.indexModel} eggs
          </Text>
        </View>

        <View style={[styles.modelRow, styles.modelRowHighlight]}>
          <Text style={[styles.modelLabel, styles.modelLabelBold]}>
            Ensemble:
          </Text>
          <Text style={[styles.modelValue, styles.modelValueBold]}>
            {details.prediction.breakdown.combined} eggs
          </Text>
        </View>
      </View>

      {/* New Prediction Button */}
      <TouchableOpacity
        style={styles.newPredictionButton}
        onPress={onNewPrediction}
      >
        <Text style={styles.newPredictionButtonText}>
          New Prediction
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Last updated: {new Date(results.timestamp).toLocaleString()}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryCard: {
    alignItems: 'center',
  },
  cardHeader: {
    marginBottom: 12,
    alignSelf: 'stretch',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  predictionMain: {
    alignItems: 'center',
    marginVertical: 16,
  },
  predictionEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  predictionValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  predictionUnit: {
    fontSize: 18,
    color: '#666',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginVertical: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confidenceText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionItem: {
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 4,
    borderRadius: 8,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionPriority: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  actionFactor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  actionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  factorItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  factorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  factorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  factorBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  factorValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  factorMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  recommendationBox: {
    backgroundColor: '#FFF8E1',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
    marginTop: 8,
  },
  recommendationText: {
    fontSize: 13,
    color: '#F57C00',
    lineHeight: 18,
  },
  modelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  modelRowHighlight: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  modelLabel: {
    fontSize: 14,
    color: '#666',
  },
  modelLabelBold: {
    fontWeight: 'bold',
    color: '#333',
  },
  modelValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  modelValueBold: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  newPredictionButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  newPredictionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
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
    textAlign: 'center',
  },
});

export default ENV_ResultsDisplay;
