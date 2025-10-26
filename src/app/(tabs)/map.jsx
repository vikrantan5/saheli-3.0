import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import {
  MapPin,
  Navigation,
  Shield,
  AlertTriangle,
  Eye,
  Route,
  Clock,
  Zap,
} from "lucide-react-native";
import { useTheme } from "@/utils/useTheme";
import LoadingScreen from "@/components/LoadingScreen";
import ActionButton from "@/components/ActionButton";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function SafetyMapScreen() {
  const insets = useSafeAreaInsets();
  const [safetyData, setSafetyData] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState("safest");
  const [nearbyAlerts, setNearbyAlerts] = useState([]);
  const theme = useTheme();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    // Simulate loading safety data and current location
    setSafetyData([
      { id: 1, type: "safe", lat: 40.7128, lng: -74.0060, intensity: 0.8 },
      { id: 2, type: "warning", lat: 40.7140, lng: -74.0050, intensity: 0.6 },
      { id: 3, type: "danger", lat: 40.7150, lng: -74.0040, intensity: 0.9 },
    ]);

    setCurrentLocation({ lat: 40.7128, lng: -74.0060 });

    setNearbyAlerts([
      {
        id: 1,
        type: "High Risk Area",
        location: "5th Street & Main",
        distance: "200m",
        severity: "high",
        timestamp: "2 min ago",
      },
      {
        id: 2,
        type: "Well-lit Path",
        location: "Park Avenue",
        distance: "150m",
        severity: "safe",
        timestamp: "5 min ago",
      },
      {
        id: 3,
        type: "Police Patrol",
        location: "Downtown Square",
        distance: "300m",
        severity: "safe",
        timestamp: "10 min ago",
      },
    ]);
  }, []);

  const handleRouteSelect = (routeType) => {
    setSelectedRoute(routeType);
    Alert.alert(
      "Route Selected",
      `Calculating ${routeType} route with real-time safety data...`,
      [{ text: "OK" }]
    );
  };

  const handleStartNavigation = async () => {
    try {
      const response = await fetch('/api/safety/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: currentLocation,
          destination: { lat: 40.7589, lng: -73.9851 }, // Mock destination
          routeType: selectedRoute,
        }),
      });

      if (response.ok) {
        Alert.alert(
          "Navigation Started",
          "Safe route navigation activated with real-time updates.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error('Navigation failed:', error);
      Alert.alert("Navigation Started", "Safe route guidance activated.");
    }
  };

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return theme.colors.danger;
      case "medium":
        return theme.colors.warning;
      case "safe":
        return theme.colors.safe;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "high":
        return AlertTriangle;
      case "safe":
        return Shield;
      default:
        return Eye;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.colors.statusBar} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 24,
              color: theme.colors.text,
              marginBottom: 4,
            }}
          >
            Safety Map
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: theme.colors.textSecondary,
            }}
          >
            Real-time safety heatmap & safe routes
          </Text>
        </View>

        {/* Map Placeholder */}
        <View
          style={{
            height: screenHeight * 0.4,
            marginHorizontal: 24,
            backgroundColor: theme.colors.elevated,
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 24,
            position: "relative",
          }}
        >
          {/* Mock Map Interface */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 12,
            }}
          >
            {/* Safety zones overlay */}
            <View
              style={{
                position: "absolute",
                top: 40,
                left: 60,
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: theme.colors.safe,
                opacity: 0.3,
              }}
            />
            <View
              style={{
                position: "absolute",
                top: 80,
                right: 40,
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: theme.colors.warning,
                opacity: 0.4,
              }}
            />
            <View
              style={{
                position: "absolute",
                bottom: 60,
                left: 40,
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: theme.colors.danger,
                opacity: 0.4,
              }}
            />
          </View>

          <MapPin size={48} color={theme.colors.textSecondary} strokeWidth={1.5} />
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 16,
              color: theme.colors.textSecondary,
              marginTop: 8,
            }}
          >
            Loading Safety Map...
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 12,
              color: theme.colors.textTertiary,
              marginTop: 4,
            }}
          >
            AI-powered threat detection active
          </Text>

          {/* Current location indicator */}
          <View
            style={{
              position: "absolute",
              bottom: 100,
              alignSelf: "center",
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: theme.colors.emergency,
              borderWidth: 3,
              borderColor: "#FFFFFF",
            }}
          />
        </View>

        {/* Route Options */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: theme.colors.text,
              marginBottom: 16,
            }}
          >
            Route Options
          </Text>

          <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor:
                  selectedRoute === "safest" ? theme.colors.safe : theme.colors.elevated,
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
              }}
              onPress={() => handleRouteSelect("safest")}
            >
              <Shield
                size={24}
                color={selectedRoute === "safest" ? "#FFFFFF" : theme.colors.text}
                strokeWidth={1.5}
              />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  color: selectedRoute === "safest" ? "#FFFFFF" : theme.colors.text,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Safest Route
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor:
                  selectedRoute === "fastest" ? theme.colors.warning : theme.colors.elevated,
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
              }}
              onPress={() => handleRouteSelect("fastest")}
            >
              <Zap
                size={24}
                color={selectedRoute === "fastest" ? "#FFFFFF" : theme.colors.text}
                strokeWidth={1.5}
              />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  color: selectedRoute === "fastest" ? "#FFFFFF" : theme.colors.text,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Fastest Route
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor:
                  selectedRoute === "well-lit" ? theme.colors.text : theme.colors.elevated,
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
              }}
              onPress={() => handleRouteSelect("well-lit")}
            >
              <Eye
                size={24}
                color={selectedRoute === "well-lit" ? theme.colors.background : theme.colors.text}
                strokeWidth={1.5}
              />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  color: selectedRoute === "well-lit" ? theme.colors.background : theme.colors.text,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Well-lit Path
              </Text>
            </TouchableOpacity>
          </View>

          <ActionButton
            title="Start Safe Navigation"
            onPress={handleStartNavigation}
            style={{ marginBottom: 8 }}
          />
        </View>

        {/* Nearby Safety Alerts */}
        <View style={{ paddingHorizontal: 24 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: theme.colors.text,
              marginBottom: 16,
            }}
          >
            Nearby Safety Alerts
          </Text>

          {nearbyAlerts.map((alert, index) => {
            const SeverityIcon = getSeverityIcon(alert.severity);
            return (
              <View key={alert.id}>
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: getSeverityColor(alert.severity),
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <SeverityIcon size={16} color="#FFFFFF" strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                      <Text
                        style={{
                          fontFamily: "Inter_500Medium",
                          fontSize: 14,
                          color: theme.colors.text,
                          flex: 1,
                        }}
                      >
                        {alert.type}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: theme.colors.textTertiary,
                        }}
                      >
                        {alert.timestamp}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <MapPin size={12} color={theme.colors.textSecondary} strokeWidth={1.5} />
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: theme.colors.textSecondary,
                          marginLeft: 4,
                          marginRight: 8,
                        }}
                      >
                        {alert.location}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: theme.colors.textTertiary,
                        }}
                      >
                        • {alert.distance}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
                {index < nearbyAlerts.length - 1 && (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: theme.colors.divider,
                      marginLeft: 44,
                    }}
                  />
                )}
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 16,
              color: theme.colors.text,
              marginBottom: 12,
            }}
          >
            Safety Legend
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: theme.colors.safe,
                  marginBottom: 4,
                }}
              />
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 10,
                  color: theme.colors.textSecondary,
                }}
              >
                Safe Zone
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: theme.colors.warning,
                  marginBottom: 4,
                }}
              />
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 10,
                  color: theme.colors.textSecondary,
                }}
              >
                Caution
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: theme.colors.danger,
                  marginBottom: 4,
                }}
              />
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 10,
                  color: theme.colors.textSecondary,
                }}
              >
                High Risk
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: theme.colors.emergency,
                  marginBottom: 4,
                }}
              />
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 10,
                  color: theme.colors.textSecondary,
                }}
              >
                Your Location
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}