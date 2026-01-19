import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, ImageIcon, AlertCircle, ArrowLeft, Trash2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/utils/useTheme';
import TopNavbar from '@/components/TopNavbar';
import DeepfakeResult from '@/components/DeepfakeResult';
import DeepfakeAnalytics from '@/components/DeepfakeAnalytics';
import { deepfakeService } from '@/services/deepfakeService';

export default function DeepfakeAnalyzerScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [apiAvailable, setApiAvailable] = useState(true);

  const handlePickImage = async () => {
    try {
      const image = await deepfakeService.pickImage();
      if (image) {
        setSelectedImage(image);
        setAnalysisResult(null);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to pick image');
    }
  };

  const handleCaptureImage = async () => {
    try {
      const image = await deepfakeService.captureImage();
      if (image) {
        setSelectedImage(image);
        setAnalysisResult(null);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to capture image');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select or capture an image first');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Check if API is available
      const isHealthy = await deepfakeService.checkHealth();
      setApiAvailable(isHealthy);

      if (!isHealthy) {
        Alert.alert(
          'Service Unavailable',
          'The deepfake detection service is currently unavailable. Please try again later.',
          [{ text: 'OK' }]
        );
        setIsAnalyzing(false);
        return;
      }

      // Analyze the image
      const result = await deepfakeService.analyzeImage(selectedImage.uri);
      setAnalysisResult(result);
      
      // Auto-delete image after analysis (privacy-first)
      setTimeout(() => {
        deepfakeService.deleteImage(selectedImage.uri);
      }, 5000);
      
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert(
        'Analysis Failed',
        error.message || 'Failed to analyze image. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Clear Analysis',
      'Are you sure you want to clear the current analysis?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            if (selectedImage) {
              deepfakeService.deleteImage(selectedImage.uri);
            }
            setSelectedImage(null);
            setAnalysisResult(null);
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.colors.statusBar} />

      {/* Top Navbar */}
      <TopNavbar 
        title="Deepfake Analyzer" 
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 16,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Info */}
        <View
          style={{
            backgroundColor: theme.colors.info + '20',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            flexDirection: 'row',
            gap: 12,
          }}
        >
          <AlertCircle size={20} color={theme.colors.info} strokeWidth={2} />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 14,
                color: theme.colors.text,
                marginBottom: 4,
              }}
            >
              Privacy-First Analysis
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 12,
                color: theme.colors.textSecondary,
                lineHeight: 18,
              }}
            >
              Images are analyzed securely and automatically deleted after processing. Your privacy is our priority.
            </Text>
          </View>
        </View>

        {/* Image Selection */}
        {!selectedImage ? (
          <View style={{ gap: 12, marginBottom: 24 }}>
            <TouchableOpacity
              data-testid="upload-image-button"
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
              }}
              onPress={handlePickImage}
            >
              <ImageIcon size={24} color="#FFFFFF" strokeWidth={2} />
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 16,
                  color: '#FFFFFF',
                }}
              >
                Upload Image
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              data-testid="capture-image-button"
              style={{
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
              }}
              onPress={handleCaptureImage}
            >
              <Camera size={24} color={theme.colors.text} strokeWidth={2} />
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 16,
                  color: theme.colors.text,
                }}
              >
                Capture Photo
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Selected Image */}
            <View
              style={{
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <Image
                source={{ uri: selectedImage.uri }}
                style={{
                  width: '100%',
                  height: 300,
                  borderRadius: 8,
                }}
                resizeMode="contain"
              />
              <View
                style={{
                  flexDirection: 'row',
                  gap: 12,
                  marginTop: 12,
                }}
              >
                <TouchableOpacity
                  data-testid="analyze-button"
                  style={{
                    flex: 1,
                    backgroundColor: theme.colors.primary,
                    borderRadius: 8,
                    padding: 12,
                    alignItems: 'center',
                  }}
                  onPress={handleAnalyze}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text
                      style={{
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 14,
                        color: '#FFFFFF',
                      }}
                    >
                      Analyze Image
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  data-testid="clear-button"
                  style={{
                    backgroundColor: theme.colors.elevated,
                    borderWidth: 1,
                    borderColor: theme.colors.divider,
                    borderRadius: 8,
                    padding: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={handleClear}
                  disabled={isAnalyzing}
                >
                  <Trash2 size={20} color={theme.colors.text} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Analysis Progress */}
            {isAnalyzing && (
              <View
                style={{
                  backgroundColor: theme.colors.elevated,
                  borderRadius: 12,
                  padding: 24,
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 16,
                    color: theme.colors.text,
                    marginTop: 16,
                  }}
                >
                  Analyzing Image...
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 14,
                    color: theme.colors.textSecondary,
                    marginTop: 8,
                    textAlign: 'center',
                  }}
                >
                  Running multi-model deepfake detection
                </Text>
              </View>
            )}

            {/* Analysis Results */}
            {analysisResult && !isAnalyzing && (
              <>
                <DeepfakeResult result={analysisResult} />
                <View style={{ height: 16 }} />
                <DeepfakeAnalytics result={analysisResult} />
                
                {/* Support Resources */}
                {analysisResult.verification_result.includes('🔴') && (
                  <View
                    style={{
                      backgroundColor: theme.colors.emergency + '20',
                      borderRadius: 12,
                      padding: 16,
                      marginTop: 16,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 14,
                        color: theme.colors.text,
                        marginBottom: 8,
                      }}
                    >
                      Need Help?
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Inter_400Regular',
                        fontSize: 12,
                        color: theme.colors.textSecondary,
                        lineHeight: 18,
                      }}
                    >
                      If this image is being used to harass, threaten, or blackmail you, please reach out to:
                      {'\n\n'}\u2022 National Cyber Crime Helpline: 1930
                      {'\n'}\u2022 Women Helpline: 1091
                      {'\n'}\u2022 Use the Community feature to get support
                    </Text>
                  </View>
                )}
              </>
            )}
          </>
        )}

        {/* How It Works */}
        <View
          style={{
            backgroundColor: theme.colors.elevated,
            borderRadius: 12,
            padding: 16,
            marginTop: 24,
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 16,
              color: theme.colors.text,
              marginBottom: 12,
            }}
          >
            How It Works
          </Text>
          <View style={{ gap: 12 }}>
            {[
              'Upload or capture an image you want to verify',
              'Our AI analyzes pixel patterns, face geometry, and texture',
              'Get detailed results with confidence scores',
              'Images are automatically deleted after analysis',
            ].map((step, index) => (
              <View key={index} style={{ flexDirection: 'row', gap: 8 }}>
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 14,
                    color: theme.colors.primary,
                  }}
                >
                  {index + 1}.
                </Text>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: 'Inter_400Regular',
                    fontSize: 14,
                    color: theme.colors.textSecondary,
                    lineHeight: 20,
                  }}
                >
                  {step}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
