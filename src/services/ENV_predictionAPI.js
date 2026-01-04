/**
 * ENV Prediction API Service
 * Handles communication with backend prediction API
 */

import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Environment API endpoints
const ENV_API_BASE = `${API_BASE_URL}/api/env`;

/**
 * Get egg production prediction with environmental analysis
 * @param {Object} environmentData - Environmental factors
 * @returns {Promise<Object>} Prediction results
 */
export const getPrediction = async (environmentData) => {
  try {
    const response = await axios.post(
      `${ENV_API_BASE}/predict/formatted`,
      environmentData,
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error
      throw new Error(error.response.data.message || 'Server error occurred');
    } else if (error.request) {
      // Request made but no response
      throw new Error('Cannot connect to server. Please check if backend is running.');
    } else {
      // Other errors
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};

/**
 * Get environmental analysis only (no prediction)
 * @param {Object} environmentData - Environmental factors
 * @returns {Promise<Object>} Analysis results
 */
export const analyzeEnvironment = async (environmentData) => {
  try {
    const response = await axios.post(
      `${ENV_API_BASE}/analyze`,
      environmentData,
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Analysis failed');
    } else if (error.request) {
      throw new Error('Cannot connect to server');
    } else {
      throw new Error(error.message);
    }
  }
};

/**
 * Calculate environmental indices
 * @param {Object} environmentData - Environmental factors
 * @returns {Promise<Object>} Calculated indices
 */
export const calculateIndices = async (environmentData) => {
  try {
    const response = await axios.post(
      `${ENV_API_BASE}/indices`,
      environmentData,
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Calculation failed');
    } else if (error.request) {
      throw new Error('Cannot connect to server');
    } else {
      throw new Error(error.message);
    }
  }
};

/**
 * Get environmental thresholds configuration
 * @param {string} factor - Optional specific factor name
 * @returns {Promise<Object>} Threshold configuration
 */
export const getThresholds = async (factor = null) => {
  try {
    const url = factor 
      ? `${ENV_API_BASE}/thresholds?factor=${factor}`
      : `${ENV_API_BASE}/thresholds`;
    
    const response = await axios.get(url, {
      timeout: 5000
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to get thresholds');
    } else if (error.request) {
      throw new Error('Cannot connect to server');
    } else {
      throw new Error(error.message);
    }
  }
};

/**
 * Check backend health status
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
  try {
    const response = await axios.get(`${ENV_API_BASE}/health`, {
      timeout: 5000
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      return { 
        success: false, 
        status: 'error',
        message: 'Server is experiencing issues'
      };
    } else if (error.request) {
      return { 
        success: false, 
        status: 'offline',
        message: 'Cannot connect to server'
      };
    } else {
      return { 
        success: false, 
        status: 'error',
        message: error.message
      };
    }
  }
};

/**
 * Test prediction with sample data
 * @param {string} testType - Type of test (optimal, warning, critical, partial)
 * @returns {Promise<Object>} Test results
 */
export const testPrediction = async (testType = 'optimal') => {
  try {
    const endpoint = testType === 'optimal' 
      ? `${ENV_API_BASE}/test`
      : `${ENV_API_BASE}/test/${testType}`;
    
    const response = await axios.get(endpoint, {
      timeout: 30000
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Test failed');
    } else if (error.request) {
      throw new Error('Cannot connect to server');
    } else {
      throw new Error(error.message);
    }
  }
};

export default {
  getPrediction,
  analyzeEnvironment,
  calculateIndices,
  getThresholds,
  checkHealth,
  testPrediction
};
