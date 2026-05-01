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
    console.log('uploadSound called with:', audioFile);
    console.log('audioFile type:', typeof audioFile);
    console.log('Is File?', audioFile instanceof File);
    console.log('Is Blob?', audioFile instanceof Blob);
    
    const formData = new FormData();
    
    // Handle web vs React Native file formats
    if (audioFile instanceof File || audioFile instanceof Blob) {
      // Web: audioFile is already a File object
      console.log('Appending as File/Blob');
      formData.append('file', audioFile);
    } else {
      // React Native: audioFile has uri, type, name properties
      console.log('Appending as React Native object');
      formData.append('file', {
        uri: audioFile.uri,
        type: audioFile.type || 'audio/wav',
        name: audioFile.name || 'poultry_sound.wav',
      });
    }

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
    console.error('Error response:', error.response?.data);
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
    
    // Handle web vs React Native file formats
    if (imageFile instanceof File || imageFile instanceof Blob) {
      // Web: imageFile is already a File object
      formData.append('file', imageFile);
    } else {
      // React Native: imageFile has uri, type, name properties
      formData.append('file', {
        uri: imageFile.uri,
        type: imageFile.type || 'image/jpeg',
        name: imageFile.name || 'poultry_image.jpg',
      });
    }

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

/**
 * Upload poultry dropping image for disease detection (Step 3)
 * @param {Object} imageFile - Image file object (from camera or gallery)
 * @param {function} onUploadProgress - Optional callback for upload progress
 * @returns {Promise<Object>} Prediction result with disease details
 */
export const uploadDropping = async (imageFile, onUploadProgress = null) => {
  try {
    const formData = new FormData();

    // Handle web vs React Native file formats
    if (imageFile instanceof File || imageFile instanceof Blob) {
      formData.append('file', imageFile);
    } else {
      formData.append('file', {
        uri: imageFile.uri,
        type: imageFile.type || 'image/jpeg',
        name: imageFile.name || 'dropping_image.jpg',
      });
    }

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

    const response = await apiClient.post('/dropping/upload', formData, config);
    return response;
  } catch (error) {
    console.error('Dropping upload error:', error);
    throw error;
  }
};

export default {
  uploadSound,
  uploadImage,
  uploadDropping,
};
