import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Service
 * Centralized AsyncStorage operations with error handling
 */

const storageService = {
  /**
   * Store data in AsyncStorage
   * @param {string} key - Storage key
   * @param {any} value - Value to store (will be stringified)
   * @returns {Promise<boolean>} Success status
   */
  setItem: async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      return false;
    }
  },

  /**
   * Retrieve data from AsyncStorage
   * @param {string} key - Storage key
   * @returns {Promise<any|null>} Parsed value or null
   */
  getItem: async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  },

  /**
   * Remove item from AsyncStorage
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} Success status
   */
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      return false;
    }
  },

  /**
   * Clear all AsyncStorage data
   * @returns {Promise<boolean>} Success status
   */
  clear: async () => {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  },

  /**
   * Get all keys from AsyncStorage
   * @returns {Promise<string[]>} Array of keys
   */
  getAllKeys: async () => {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  },

  /**
   * Store multiple items at once
   * @param {Array<[string, any]>} keyValuePairs - Array of [key, value] pairs
   * @returns {Promise<boolean>} Success status
   */
  multiSet: async (keyValuePairs) => {
    try {
      const jsonPairs = keyValuePairs.map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(jsonPairs);
      return true;
    } catch (error) {
      console.error('Error in multiSet:', error);
      return false;
    }
  },

  /**
   * Retrieve multiple items at once
   * @param {string[]} keys - Array of keys
   * @returns {Promise<Object>} Object with key-value pairs
   */
  multiGet: async (keys) => {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      const result = {};
      pairs.forEach(([key, value]) => {
        result[key] = value != null ? JSON.parse(value) : null;
      });
      return result;
    } catch (error) {
      console.error('Error in multiGet:', error);
      return {};
    }
  },
};

export default storageService;
