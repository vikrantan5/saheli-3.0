import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import { X, Camera as CameraIcon } from 'lucide-react-native';
import { useTheme } from '@/utils/useTheme';

export default function SOSCameraCapture({ visible, onCapture, onClose }) {
  const theme = useTheme();
  const [hasPermission, setHasPermission] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (visible) {
      requestCameraPermission();
    }
  }, [visible]);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    
    if (status === 'granted') {
      // Auto-capture after 1 second
      setTimeout(() => {
        capturePhoto();
      }, 1000);
    }
  };

  const capturePhoto = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });
      
      console.log('✅ Photo captured:', photo.uri);
      onCapture(photo.uri);
    } catch (error) {
      console.error('❌ Error capturing photo:', error);
      onCapture(null);
    } finally {
      setIsCapturing(false);
    }
  };

  if (!visible) return null;

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.text, { color: theme.colors.text }]}>
            Requesting camera permission...
          </Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.text, { color: theme.colors.text }]}>
            Camera permission denied. Continuing without photo...
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={() => onCapture(null)}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.back}
        autoFocus={Camera.Constants.AutoFocus.on}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => onCapture(null)}
          >
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.centerContent}>
            {isCapturing ? (
              <>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.captureText}>Capturing evidence...</Text>
              </>
            ) : (
              <>
                <CameraIcon size={48} color="#FFFFFF" />
                <Text style={styles.captureText}>Auto-capturing photo...</Text>
              </>
            )}
          </View>

          <View style={styles.bottomInfo}>
            <Text style={styles.infoText}>
              📸 Evidence photo will be sent to emergency contacts
            </Text>
          </View>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
    padding: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  bottomInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  text: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
