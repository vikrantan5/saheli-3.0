import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8001';

export const deepfakeService = {
  /**
   * Pick an image from the device library
   */
  async pickImage() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Sorry, we need camera roll permissions to analyze images.');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      throw error;
    }
  },

  /**
   * Capture an image using the camera
   */
  async captureImage() {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Sorry, we need camera permissions to capture images.');
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error capturing image:', error);
      throw error;
    }
  },

  /**
   * Convert image URI to base64
   */
  async convertToBase64(uri) {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('Error converting to base64:', error);
      throw error;
    }
  },

  /**
   * Analyze an image for deepfake detection
   */
  async analyzeImage(imageUri) {
    try {
      // Convert image to base64
      const base64Image = await this.convertToBase64(imageUri);
      
      // Send to backend API
      const response = await fetch(`${API_BASE_URL}/api/analyze-deepfake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_base64: base64Image,
          mime_type: 'image/jpeg',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Analysis failed: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  },

  /**
   * Delete image from device (privacy-first)
   */
  async deleteImage(uri) {
    try {
      if (uri && uri.startsWith('file://')) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      // Don't throw - deletion is best-effort
    }
  },

  /**
   * Check if backend API is available
   */
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  },
};
