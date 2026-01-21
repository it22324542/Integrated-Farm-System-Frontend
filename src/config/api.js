// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:5000',
  ENDPOINTS: {
    // Egg Grading (existing)
    GRADING_PREDICT: '/api/egg-grading/predict',
    GRADING_BATCH: '/api/egg-grading/predict-batch',
    GRADING_INFO: '/api/egg-grading/model-info',
    GRADING_HEALTH: '/api/egg-grading/health',
    
    // Egg Quality (NEW)
    QUALITY_PREDICT: '/api/egg-quality/predict',
    QUALITY_BATCH: '/api/egg-quality/predict-batch',
    QUALITY_BASE64: '/api/egg-quality/predict-base64',
    QUALITY_INFO: '/api/egg-quality/model-info',
    QUALITY_HEALTH: '/api/egg-quality/health'
  }
};

// Egg Grading API (existing)
export const EggGradingAPI = {
  predictGrade: async (height, diameter, weight) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS. GRADING_PREDICT}`,
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
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GRADING_HEALTH}`
      );
      return await response.json();
    } catch (error) {
      throw new Error('Network error:  ' + error.message);
    }
  }
};

// Egg Quality API (FIXED)
export const EggQualityAPI = {
  predictQuality: async (imageUri) => {
    try {
      // Create FormData
      const formData = new FormData();
      
      // Get file info from URI
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      // Append image to FormData
      formData.append('image', {
        uri: imageUri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      });
      
      console.log('Sending image:', imageUri);
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.QUALITY_PREDICT}`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      const data = await response.json();
      console.log('Response:', data);
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw new Error('Network error: ' + error.message);
    }
  },

  predictQualityBase64: async (base64Image) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS. QUALITY_BASE64}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64Image })
        }
      );
      return await response.json();
    } catch (error) {
      throw new Error('Network error: ' + error.message);
    }
  },

  getModelInfo: async () => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS. QUALITY_INFO}`
      );
      return await response.json();
    } catch (error) {
      throw new Error('Network error: ' + error.message);
    }
  },

  checkHealth: async () => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.QUALITY_HEALTH}`
      );
      return await response.json();
    } catch (error) {
      throw new Error('Network error:  ' + error.message);
    }
  }
};

export default API_CONFIG;