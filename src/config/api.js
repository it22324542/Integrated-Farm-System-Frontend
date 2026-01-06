// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://172.20.10.7:5000', // ← CHANGE THIS TO YOUR IP! 
  ENDPOINTS: {
    PREDICT: '/api/egg-grading/predict',
    PREDICT_BATCH: '/api/egg-grading/predict-batch',
    MODEL_INFO: '/api/egg-grading/model-info',
    HEALTH: '/api/egg-grading/health'
  }
};

// API Service
export const EggGradingAPI = {
  predictGrade: async (height, diameter, weight) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG. ENDPOINTS.PREDICT}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ height, diameter, weight })
        }
      );
      return await response.json();
    } catch (error) {
      throw new Error('Network error:  ' + error.message);
    }
  },

  checkHealth: async () => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`
      );
      return await response.json();
    } catch (error) {
      throw new Error('Network error: ' + error.message);
    }
  }
};

export default API_CONFIG;