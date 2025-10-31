import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { 
  X, CheckCircle, XCircle, MapPin, Navigation,
  Lightbulb, Wifi, Home, ShieldCheck, Users 
} from 'lucide-react-native';
import { useTheme } from '@/utils/useTheme';
import { verifySafetyMarker } from '@/services/safetyMapService';

export default function VerificationModal({ visible, onClose, marker }) {
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userAttributes, setUserAttributes] = useState({
    streetLighting: null,
    networkConnectivity: null,
    areaType: null,
    policeSecurity: null,
    crowdActivity: null,
  });

  const attributeOptions = {
    streetLighting: {
      icon: Lightbulb,
      label: 'Street Lighting',
      emoji: '💡',
      options: [
        { value: 'good', label: 'Good' },
        { value: 'poor', label: 'Poor' },
        { value: 'none', label: 'None' },
      ],
    },
    networkConnectivity: {
      icon: Wifi,
      label: 'Network',
      emoji: '📶',
      options: [
        { value: 'excellent', label: 'Excellent' },
        { value: 'good', label: 'Good' },
        { value: 'poor', label: 'Poor' },
        { value: 'none', label: 'None' },
      ],
    },
    areaType: {
      icon: Home,
      label: 'Area Type',
      emoji: '🏚️',
      options: [
        { value: 'residential', label: 'Residential' },
        { value: 'commercial', label: 'Commercial' },
        { value: 'slum', label: 'Slum' },
        { value: 'isolated', label: 'Isolated' },
      ],
    },
    policeSecurity: {
      icon: ShieldCheck,
      label: 'Police/Security',
      emoji: '🚓',
      options: [
        { value: 'present', label: 'Present' },
        { value: 'absent', label: 'Absent' },
      ],
    },
    crowdActivity: {
      icon: Users,
      label: 'Crowd',
      emoji: '🧍',
      options: [
        { value: 'crowded', label: 'Crowded' },
        { value: 'moderate', label: 'Moderate' },
        { value: 'deserted', label: 'Deserted' },
      ],
    },
  };

  const handleAttributeSelect = (attributeName, value) => {
    setUserAttributes(prev => ({
      ...prev,
      [attributeName]: value,
    }));
  };

  const handleVerify = async (isVerifying) => {
    if (!marker) return;

    setIsSubmitting(true);
    try {
      await verifySafetyMarker(marker.id, isVerifying, userAttributes);
      
      alert(
        isVerifying ? '✅ Verification Submitted!' : '⚠️ Dispute Submitted',
        isVerifying 
          ? 'Thank you for helping verify this safety marker!' 
          : 'Your dispute has been recorded.'
      );
      
      // Reset form
      setUserAttributes({
        streetLighting: null,
        networkConnectivity: null,
        areaType: null,
        policeSecurity: null,
        crowdActivity: null,
      });
      
      onClose();
    } catch (error) {
      console.error('Error verifying marker:', error);
      alert('Failed to submit verification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!marker) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View
          style={{
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 20,
            paddingBottom: 40,
            maxHeight: '80%',
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 24,
              marginBottom: 20,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: theme.colors.warning,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}
              >
                <CheckCircle size={16} color="#FFFFFF" strokeWidth={2} />
              </View>
              <View>
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 20,
                    color: theme.colors.text,
                  }}
                >
                  Verify Marker
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                  }}
                >
                  {marker.distance ? `${(marker.distance * 1000).toFixed(0)}m away` : 'Nearby'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: theme.colors.buttonBackground,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <X size={20} color={theme.colors.text} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Marker Info */}
            <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
              <View style={{
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                padding: 16,
              }}>
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 14,
                    color: theme.colors.text,
                    marginBottom: 8,
                  }}
                >
                  Original Report: {marker.status?.toUpperCase()}
                </Text>
                {marker.note && (
                  <Text
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 13,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    {marker.note}
                  </Text>
                )}
              </View>
            </View>

            {/* Verification Attributes */}
            <View style={{ paddingHorizontal: 24 }}>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 16,
                  color: theme.colors.text,
                  marginBottom: 8,
                }}
              >
                Verify Safety Attributes
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                  marginBottom: 16,
                }}
              >
                Help verify the details of this location
              </Text>

              {Object.entries(attributeOptions).map(([key, config]) => (
                <View key={key} style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 16, marginRight: 6 }}>{config.emoji}</Text>
                    <Text
                      style={{
                        fontFamily: 'Inter_500Medium',
                        fontSize: 13,
                        color: theme.colors.text,
                      }}
                    >
                      {config.label}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {config.options.map((opt) => {
                      const isSelected = userAttributes[key] === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 16,
                            backgroundColor: isSelected ? theme.colors.success : theme.colors.elevated,
                            borderWidth: 1,
                            borderColor: isSelected ? theme.colors.success : theme.colors.border,
                          }}
                          onPress={() => handleAttributeSelect(key, opt.value)}
                        >
                          <Text
                            style={{
                              fontFamily: 'Inter_500Medium',
                              fontSize: 12,
                              color: isSelected ? '#FFFFFF' : theme.colors.text,
                            }}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={{ paddingHorizontal: 24, marginTop: 24, gap: 12 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.success,
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isSubmitting ? 0.6 : 1,
                }}
                onPress={() => handleVerify(true)}
                disabled={isSubmitting}
                data-testid="verify-button"
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <CheckCircle size={20} color="#FFFFFF" strokeWidth={2} style={{ marginRight: 8 }} />
                    <Text
                      style={{
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 16,
                        color: '#FFFFFF',
                      }}
                    >
                      Verify Information
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.elevated,
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isSubmitting ? 0.6 : 1,
                }}
                onPress={() => handleVerify(false)}
                disabled={isSubmitting}
                data-testid="dispute-button"
              >
                <XCircle size={20} color={theme.colors.danger} strokeWidth={2} style={{ marginRight: 8 }} />
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 16,
                    color: theme.colors.danger,
                  }}
                >
                  Dispute Information
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
