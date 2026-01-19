import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Vibration,
  Linking,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  Shield,
  Phone,
  Volume2,
  MapPin,
  Users,
  AlertTriangle,
  PhoneCall,
  Mic,
  Eye,
  Activity,
  Sun,
  Moon,
  Monitor,
  ScanFace,
} from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/utils/useTheme";
import { useThemeContext } from "@/utils/ThemeContext";
import LoadingScreen from "@/components/LoadingScreen";
import ActionButton from "@/components/ActionButton";
import AlarmModal from "@/components/AlarmModal";
import SOSCameraCapture from "@/components/SOSCameraCapture";
import VerificationRequestBanner from "@/components/VerificationRequestBanner";
import TopNavbar from "@/components/TopNavbar";
import { triggerSOS } from "@/services/sosService";
import { getCurrentLocation } from "@/services/locationService";
import { getPendingVerificationMarkers } from "@/services/safetyMapService";

export default function SafetyHomeScreen() {
  const insets = useSafeAreaInsets();
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [sosCountdown, setSOSCountdown] = useState(5);
  const [safetyStatus, setSafetyStatus] = useState("Safe");
  const [nearbyResources, setNearbyResources] = useState([]);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const theme = useTheme();
  const { toggleTheme, themeMode } = useThemeContext();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    // Simulate fetching nearby safety resources with phone numbers
    setNearbyResources([
      { 
        type: "Police Station", 
        distance: "0.8 km", 
        name: "Central Police",
        phone: "100" // Emergency police number
      },
      { 
        type: "Hospital", 
        distance: "1.2 km", 
        name: "City General",
        phone: "102" // Emergency ambulance number
      },
      { 
        type: "Safe Haven", 
        distance: "0.3 km", 
        name: "Community Center",
        phone: "1091" // Women helpline number
      },
    ]);

    // Check for pending verifications
    checkPendingVerifications();
  }, []);

  const checkPendingVerifications = async () => {
    try {
      const location = await getCurrentLocation();
      if (location) {
        const pending = await getPendingVerificationMarkers(location, 0.5);
        setPendingVerifications(pending);
        
        if (pending.length > 0) {
          console.log(`📍 Found ${pending.length} markers pending verification nearby`);
        }
      }
    } catch (error) {
      console.error('Error checking pending verifications:', error);
    }
  };

  useEffect(() => {
    let interval;
    if (isSOSActive && sosCountdown > 0) {
      interval = setInterval(() => {
        setSOSCountdown(prev => prev - 1);
      }, 1000);
    } else if (isSOSActive && sosCountdown === 0) {
      // Show camera to capture photo
      setShowCamera(true);
    }
    return () => clearInterval(interval);
  }, [isSOSActive, sosCountdown]);

  const handleCameraCapture = (photoUri) => {
    setShowCamera(false);
    setCapturedPhotoUri(photoUri);
    
    // Continue with SOS activation
    handleSOSActivation(photoUri);
    
    // Reset countdown
    setIsSOSActive(false);
    setSOSCountdown(5);
  };

  const handleSOSPress = () => {
    if (isSOSActive) {
      // Cancel SOS
      setIsSOSActive(false);
      setSOSCountdown(5);
      return;
    }

    // Start SOS countdown
    setIsSOSActive(true);
    Vibration.vibrate([100, 200, 100]);
  };

  const handleSOSActivation = async (photoUri = null) => {
    try {
      // Show loading alert
      Alert.alert(
        "🚨 SOS Activating",
        "Sending emergency alerts...",
        [],
        { cancelable: false }
      );

      // Trigger SOS with all emergency protocols (including photo if captured)
      const result = await triggerSOS(photoUri);

      // Build success message
      let message = "Emergency protocols activated:\n\n";
      
      if (result.photoCapture && !result.photoCapture.skipped) {
        if (result.imageUrl) {
          message += `📸 Evidence photo captured & uploaded\n`;
        } else if (result.imageUploadError) {
          message += `⚠️ Photo: ${result.imageUploadError}\n`;
        }
      }
      
      if (result.sms.success) {
        message += `✅ SMS sent to ${result.sms.sentTo} contact(s)\n`;
      } else if (result.sms.error) {
        message += `⚠️ SMS: ${result.sms.error}\n`;
      }

      if (result.call.success) {
        message += `✅ ${result.call.message}\n`;
      } else if (result.call.error) {
        message += `⚠️ Call: ${result.call.error}\n`;
      }

      if (result.location) {
        message += `\n📍 Location shared:\n${result.location.latitude.toFixed(6)}, ${result.location.longitude.toFixed(6)}`;
      } else {
        message += `\n⚠️ Location unavailable`;
      }

      // Show success alert
      Alert.alert(
        "🚨 SOS Alert Sent!",
        message,
        [{ text: "OK" }]
      );

    } catch (error) {
      console.error('SOS activation failed:', error);
      
      // Show error alert
      Alert.alert(
        "SOS Error",
        error.message || "Failed to send emergency alert. Please ensure you have added emergency contacts in your profile and granted necessary permissions.",
        [{ text: "OK" }]
      );
    }
  };

  const handleFakeCall = () => {
    // Navigate to fake call screen
    router.push("/fake-call");
  };

  const handleLoudAlarm = () => {
    // Activate the alarm modal
    setIsAlarmActive(true);
    Vibration.vibrate([500, 200, 500, 200, 500]);
  };

  const handleCallResource = (resource) => {
    Alert.alert(
      `Call ${resource.name}?`,
      `Do you want to call ${resource.type} at ${resource.phone}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Call Now",
          onPress: async () => {
            try {
              const phoneUrl = `tel:${resource.phone}`;
              const canOpen = await Linking.canOpenURL(phoneUrl);
              
              if (canOpen) {
                await Linking.openURL(phoneUrl);
              } else {
                Alert.alert("Error", "Cannot make phone calls on this device");
              }
            } catch (error) {
              console.error("Error making call:", error);
              Alert.alert("Error", "Failed to make call. Please try again.");
            }
          },
        },
      ]
    );
  };

  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light':
        return Sun;
      case 'dark':
        return Moon;
      case 'system':
        return Monitor;
      default:
        return Sun;
    }
  };

  const getThemeLabel = () => {
    switch (themeMode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'Auto';
      default:
        return 'Auto';
    }
  };

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.colors.statusBar} />

      {/* Top Navbar */}
      <TopNavbar title="Saheli" />

      {/* Alarm Modal */}
      <AlarmModal 
        visible={isAlarmActive} 
        onClose={() => setIsAlarmActive(false)} 
      />

      {/* SOS Camera Capture */}
      <SOSCameraCapture
        visible={showCamera}
        onCapture={handleCameraCapture}
        onClose={() => {
          setShowCamera(false);
          setIsSOSActive(false);
          setSOSCountdown(5);
        }}
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
        {/* Header with Theme Toggle */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {/* Theme Toggle Button */}
            <TouchableOpacity
              onPress={toggleTheme}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme.colors.elevated,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 8,
              }}
              data-testid="theme-toggle-button"
            >
              {(() => {
                const ThemeIcon = getThemeIcon();
                return <ThemeIcon size={20} color={theme.colors.text} strokeWidth={2} />;
              })()}
            </TouchableOpacity>

            {/* Safety Status */}
            <View
              style={{
                backgroundColor: theme.colors.safe,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  color: "#FFFFFF",
                }}
              >
                {safetyStatus}
              </Text>
            </View>
          </View>
        </View>

        {/* Verification Request Banner */}
        <VerificationRequestBanner
          pendingCount={pendingVerifications.length}
          onPress={() => router.push("/(tabs)/map")}
          onDismiss={() => setPendingVerifications([])}
        />

        {/* Main SOS Button */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <TouchableOpacity
            data-testid="sos-button"
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: isSOSActive ? theme.colors.warning : theme.colors.emergency,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
            onPress={handleSOSPress}
            activeOpacity={0.8}
          >
            {isSOSActive ? (
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 36,
                    color: "#FFFFFF",
                    marginBottom: 8,
                  }}
                >
                  {sosCountdown}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 12,
                    color: "#FFFFFF",
                  }}
                >
                  TAP TO CANCEL
                </Text>
              </View>
            ) : (
              <View style={{ alignItems: "center" }}>
                <Shield size={48} color="#FFFFFF" strokeWidth={2} />
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 18,
                    color: "#FFFFFF",
                    marginTop: 8,
                  }}
                >
                  SOS
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: theme.colors.textSecondary,
              textAlign: "center",
              marginTop: 16,
              lineHeight: 20,
            }}
          >
            Hold to activate emergency protocol{"\n"}
            Alerts contacts & authorities instantly
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: theme.colors.text,
              marginBottom: 16,
            }}
          >
            Quick Actions
          </Text>

          <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
            <TouchableOpacity
              data-testid="fake-call-button"
              style={{
                flex: 1,
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
              }}
              onPress={handleFakeCall}
            >
              <PhoneCall size={24} color={theme.colors.text} strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  color: theme.colors.text,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Fake Call
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              data-testid="loud-alarm-button"
              style={{
                flex: 1,
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
              }}
              onPress={handleLoudAlarm}
            >
              <Volume2 size={24} color={theme.colors.text} strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  color: theme.colors.text,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Loud Alarm
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
              }}
              onPress={() => router.push("/(tabs)/map")}
            >
              <MapPin size={24} color={theme.colors.text} strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  color: theme.colors.text,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Safe Routes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
              }}
              onPress={() => router.push("/(tabs)/community")}
            >
              <Users size={24} color={theme.colors.text} strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  color: theme.colors.text,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Community
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
            <TouchableOpacity
              data-testid="deepfake-analyzer-button"
              style={{
                flex: 1,
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
              }}
              onPress={() => router.push("/deepfake-analyzer")}
            >
              <ScanFace size={24} color={theme.colors.text} strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  color: theme.colors.text,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Deepfake Analyzer
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Safety Status */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: theme.colors.text,
              marginBottom: 16,
            }}
          >
            Current Status
          </Text>

          <View
            style={{
              backgroundColor: theme.colors.elevated,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: theme.colors.safe,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Eye size={16} color="#FFFFFF" strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                    color: theme.colors.text,
                  }}
                >
                  AI Monitoring: Active
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Scanning environment for threats
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: theme.colors.safe,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Activity size={16} color="#FFFFFF" strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                    color: theme.colors.text,
                  }}
                >
                  Location Sharing: On
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Trusted contacts can see your location
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Nearby Resources */}
        <View>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: theme.colors.text,
              marginBottom: 16,
            }}
          >
            Nearby Safety Resources
          </Text>

          {nearbyResources.map((resource, index) => (
            <View key={index}>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                }}
                onPress={() => handleCallResource(resource)}
                data-testid={`call-resource-${index}`}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: theme.colors.buttonBackground,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <Shield size={16} color={theme.colors.text} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 14,
                      color: theme.colors.text,
                      marginBottom: 2,
                    }}
                  >
                    {resource.name}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    {resource.type} • {resource.distance}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: theme.colors.success,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                  }}
                >
                  <Phone size={14} color="#FFFFFF" strokeWidth={1.5} />
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      color: "#FFFFFF",
                      marginLeft: 4,
                    }}
                  >
                    Call
                  </Text>
                </View>
              </TouchableOpacity>
              {index < nearbyResources.length - 1 && (
                <View
                  style={{
                    height: 1,
                    backgroundColor: theme.colors.divider,
                    marginLeft: 44,
                  }}
                />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}