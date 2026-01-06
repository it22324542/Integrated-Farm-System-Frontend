import apiClient from '../config/api';

/**
 * Poultry Health Detection Service
 * Handles sound and image upload for poultry health analysis
 */

/**
 * Upload poultry sound for health analysis
 * @param {Object} audioFile - Audio file object (from file picker or recorder)
 * @param {function} onUploadProgress - Optional callback for upload progress
 * @returns {Promise<Object>} Prediction result
 */
export const uploadSound = async (audioFile, onUploadProgress = null) => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: audioFile.uri,
      type: audioFile.type || 'audio/wav',
      name: audioFile.name || 'poultry_sound.wav',
    });

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (onUploadProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onUploadProgress(percentCompleted);
      };
    }

    const response = await apiClient.post('/sound/upload', formData, config);
    return response;
  } catch (error) {
    console.error('Sound upload error:', error);
    throw error;
  }
};

/**
 * Upload poultry image for health analysis
 * @param {Object} imageFile - Image file object (from camera or gallery)
 * @param {function} onUploadProgress - Optional callback for upload progress
 * @returns {Promise<Object>} Prediction result
 */
export const uploadImage = async (imageFile, onUploadProgress = null) => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: imageFile.uri,
      type: imageFile.type || 'image/jpeg',
      name: imageFile.name || 'poultry_image.jpg',
    });

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (onUploadProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onUploadProgress(percentCompleted);
      };
    }

    const response = await apiClient.post('/image/upload', formData, config);
    return response;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

export default {
  uploadSound,
  uploadImage,
};
