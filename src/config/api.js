import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * API Configuration
 * Centralized Axios instance with interceptors for request/response handling
 */

// Get API URL from environment variables
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:5000/api';

console.log('========================================');
console.log('🔧 API CONFIGURATION LOADED');
console.log('========================================');
console.log('expo config apiUrl:', Constants.expoConfig?.extra?.apiUrl);
console.log('Final API_BASE_URL:', API_BASE_URL);
console.log('========================================');

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Adds authentication token to all requests if available
 */
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Log the request for debugging
      console.log('API Request:', {
        method: config.method,
        url: config.baseURL + config.url,
        headers: config.headers
      });
      
      // Retrieve auth token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    } catch (error) {
      console.error('Error reading auth token:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles global error responses and token refresh logic
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return successful response data
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Clear stored token
        await AsyncStorage.removeItem('authToken');
        
        // TODO: Implement token refresh logic here if needed
        // const newToken = await refreshAuthToken();
        // await AsyncStorage.setItem('authToken', newToken);
        // return apiClient(originalRequest);
        
        // For now, reject and let the app handle re-authentication
        return Promise.reject(error);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('Resource not found:', error.config.url);
    }

    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      console.error('Server error occurred:', error.response.data);
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error - no response received');
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        config: error.config ? {
          url: error.config.url,
          baseURL: error.config.baseURL,
          method: error.config.method
        } : 'No config'
      });
    }

    return Promise.reject(error);
  }
);

/**
 * API Service Methods
 * Reusable methods for common HTTP operations
 */
export const api = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data, config = {}) => apiClient.post(url, data, config),
  put: (url, data, config = {}) => apiClient.put(url, data, config),
  patch: (url, data, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
};

export default apiClient;
