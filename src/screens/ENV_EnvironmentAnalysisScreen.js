/**
 * ENV Environment Analysis Screen
 * Main screen for environment prediction feature
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import ENV_PredictionForm from '../components/ENV_PredictionForm';
import ENV_ResultsDisplay from '../components/ENV_ResultsDisplay';
import { getPrediction } from '../services/ENV_predictionAPI';

const ENV_EnvironmentAnalysisScreen = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    
    try {
      const response = await getPrediction(formData);
      
      if (response.success) {
        setResults(response);
        setShowResults(true);
      } else {
        Alert.alert(
          'Prediction Failed',
          response.message || 'Unable to get prediction. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Prediction error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to connect to server. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNewPrediction = () => {
    setShowResults(false);
    setResults(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {!showResults ? (
        <ENV_PredictionForm 
          onSubmit={handleSubmit} 
          loading={loading}
        />
      ) : (
        <ENV_ResultsDisplay 
          results={results}
          onNewPrediction={handleNewPrediction}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default ENV_EnvironmentAnalysisScreen;
