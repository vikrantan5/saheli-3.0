import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
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
  AlertTriangle,
  Clock,
  MapPin,
  Eye,
  Shield,
  Bell,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react-native";
import { useTheme } from "@/utils/useTheme";
import LoadingScreen from "@/components/LoadingScreen";
import ActionButton from "@/components/ActionButton";
import TopNavbar from "@/components/TopNavbar";
import { subscribeToSafetyMarkers } from "@/services/safetyMapService";
import { auth } from "@/config/firebaseConfig";

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const [alerts, setAlerts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const theme = useTheme();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const filterOptions = [
    { id: "all", label: "All Alerts", count: 0 },
    { id: "active", label: "Active", count: 0 },
    { id: "resolved", label: "Resolved", count: 0 },
    { id: "mine", label: "My Alerts", count: 0 },
  ];

  useEffect(() => {
    loadAlerts();
    
    // Subscribe to safety markers from map
    const unsubscribe = subscribeToSafetyMarkers((markers) => {
      // Convert markers to alerts format
      const mapAlerts = markers.map(marker => {
        const timeAgo = getTimeAgo(marker.timestamp);
        return {
          id: `marker_${marker.id}`,
          type: getMarkerAlertType(marker.status),
          description: marker.note || `${marker.status.toUpperCase()} zone marked by community member`,
          location: `${marker.coordinates.latitude.toFixed(4)}, ${marker.coordinates.longitude.toFixed(4)}`,
          coordinates: marker.coordinates,
          severity: getMarkerSeverity(marker.status),
          status: "active",
          timestamp: timeAgo,
          reporter: "Safety Map User",
          isMyAlert: marker.userId === auth.currentUser?.uid,
          isFromMap: true,
        };
      });
      
      // Combine with existing alerts
      setAlerts(prevAlerts => {
        // Filter out old map alerts
        const nonMapAlerts = prevAlerts.filter(alert => !alert.isFromMap);
        // Add new map alerts
        return [...mapAlerts, ...nonMapAlerts];
      });
    });

    return () => unsubscribe();
  }, []);

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "Just now";
    const now = new Date();
    const past = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getMarkerAlertType = (status) => {
    switch (status) {
      case "unsafe":
        return "Danger Zone Alert";
      case "caution":
        return "Caution Zone Alert";
      case "safe":
        return "Safe Zone Update";
      default:
        return "Safety Update";
    }
  };

  const getMarkerSeverity = (status) => {
    switch (status) {
      case "unsafe":
        return "high";
      case "caution":
        return "medium";
      case "safe":
        return "info";
      default:
        return "info";
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await fetch('/api/safety/alerts');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      } else {
        // Fallback to mock data
        setAlerts([
          {
            id: 1,
            type: "Suspicious Activity",
            description: "Person following women in downtown area. Multiple reports received.",
            location: "5th Street & Main Ave",
            coordinates: { lat: 40.7128, lng: -74.0060 },
            severity: "high",
            status: "active",
            timestamp: "15 min ago",
            reporter: "Community Member",
            isMyAlert: false,
          },
          {
            id: 2,
            type: "Well-lit Safe Path",
            description: "New LED street lighting installed along Park Avenue corridor.",
            location: "Park Avenue (1st to 5th St)",
            coordinates: { lat: 40.7140, lng: -74.0050 },
            severity: "info",
            status: "active",
            timestamp: "2 hours ago",
            reporter: "City Safety Team",
            isMyAlert: false,
          },
          {
            id: 3,
            type: "Emergency Alert",
            description: "SOS alert activated - Emergency services notified and responding.",
            location: "Central Business District",
            coordinates: { lat: 40.7150, lng: -74.0040 },
            severity: "critical",
            status: "resolved",
            timestamp: "1 day ago",
            reporter: "Sarah J.",
            isMyAlert: true,
          },
          {
            id: 4,
            type: "Police Patrol Update",
            description: "Increased police patrols in response to recent incidents in the area.",
            location: "Downtown Shopping District",
            coordinates: { lat: 40.7160, lng: -74.0030 },
            severity: "info",
            status: "active",
            timestamp: "3 hours ago",
            reporter: "Police Department",
            isMyAlert: false,
          },
        ]);
      }
    } catch (error) {
      // Using fallback mock data (no backend API available)
      setAlerts([]);
    }
  };

  const handleAlertAction = async (alertId, action) => {
    try {
      // Update local state (using Firebase-based alerts)
      if (action === 'resolve') {
        setAlerts(alerts.map(alert => 
          alert.id === alertId ? { ...alert, status: 'resolved' } : alert
        ));
        Alert.alert("Alert Resolved", "The alert has been marked as resolved.");
      } else if (action === 'dismiss') {
        setAlerts(alerts.filter(alert => alert.id !== alertId));
        Alert.alert("Alert Dismissed", "The alert has been dismissed.");
      }
    } catch (error) {
      console.error('Failed to update alert:', error);
      Alert.alert("Error", "Failed to update alert. Please try again.");
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return theme.colors.emergency;
      case "high":
        return theme.colors.danger;
      case "medium":
        return theme.colors.warning;
      case "info":
        return theme.colors.success;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "critical":
      case "high":
        return AlertTriangle;
      case "info":
        return Info;
      default:
        return Shield;
    }
  };

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  // Update filter counts
  const updatedFilterOptions = filterOptions.map(option => {
    let count = 0;
    switch (option.id) {
      case "all":
        count = alerts.length;
        break;
      case "active":
        count = alerts.filter(alert => alert.status === "active").length;
        break;
      case "resolved":
        count = alerts.filter(alert => alert.status === "resolved").length;
        break;
      case "mine":
        count = alerts.filter(alert => alert.isMyAlert).length;
        break;
    }
    return { ...option, count };
  });

  const filteredAlerts = alerts.filter(alert => {
    switch (selectedFilter) {
      case "active":
        return alert.status === "active";
      case "resolved":
        return alert.status === "resolved";
      case "mine":
        return alert.isMyAlert;
      default:
        return true;
    }
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.colors.statusBar} />

      {/* Top Navbar */}
      <TopNavbar title="Safety Alerts" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: insets.bottom + 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: theme.colors.textSecondary,
            }}
          >
            Real-time safety notifications & updates
          </Text>
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingRight: 48 }}
          style={{ marginBottom: 24 }}
        >
          <View style={{ flexDirection: "row", gap: 12 }}>
            {updatedFilterOptions.map((option) => {
              const isSelected = selectedFilter === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={{
                    backgroundColor: isSelected ? theme.colors.text : theme.colors.elevated,
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                  onPress={() => setSelectedFilter(option.id)}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 14,
                      color: isSelected ? theme.colors.background : theme.colors.text,
                    }}
                  >
                    {option.label}
                  </Text>
                  <View
                    style={{
                      backgroundColor: isSelected ? theme.colors.background : theme.colors.buttonBackground,
                      borderRadius: 10,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      minWidth: 20,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 10,
                        color: isSelected ? theme.colors.text : theme.colors.text,
                      }}
                    >
                      {option.count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Alerts List */}
        <View style={{ paddingHorizontal: 24 }}>
          {filteredAlerts.map((alert, index) => {
            const SeverityIcon = getSeverityIcon(alert.severity);
            const severityColor = getSeverityColor(alert.severity);
            
            return (
              <View key={alert.id}>
                <TouchableOpacity
                  style={{
                    backgroundColor: theme.colors.elevated,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                    borderLeftWidth: 4,
                    borderLeftColor: severityColor,
                  }}
                  activeOpacity={0.8}
                >
                  {/* Alert Header */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: severityColor,
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
                            fontFamily: "Inter_600SemiBold",
                            fontSize: 16,
                            color: theme.colors.text,
                            flex: 1,
                          }}
                        >
                          {alert.type}
                        </Text>
                        <View
                          style={{
                            backgroundColor: alert.status === "resolved" ? theme.colors.success : theme.colors.warning,
                            borderRadius: 12,
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "Inter_500Medium",
                              fontSize: 10,
                              color: "#FFFFFF",
                              textTransform: "capitalize",
                            }}
                          >
                            {alert.status}
                          </Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Clock size={12} color={theme.colors.textTertiary} strokeWidth={1.5} />
                        <Text
                          style={{
                            fontFamily: "Inter_400Regular",
                            fontSize: 12,
                            color: theme.colors.textTertiary,
                            marginLeft: 4,
                            marginRight: 8,
                          }}
                        >
                          {alert.timestamp}
                        </Text>
                        <Text
                          style={{
                            fontFamily: "Inter_400Regular",
                            fontSize: 12,
                            color: theme.colors.textSecondary,
                          }}
                        >
                          by {alert.reporter}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Alert Content */}
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: theme.colors.text,
                      lineHeight: 20,
                      marginBottom: 12,
                    }}
                  >
                    {alert.description}
                  </Text>

                  {/* Location */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <MapPin size={14} color={theme.colors.textSecondary} strokeWidth={1.5} />
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 12,
                        color: theme.colors.textSecondary,
                        marginLeft: 4,
                      }}
                    >
                      {alert.location}
                    </Text>
                  </View>

                  {/* Alert Actions */}
                  {alert.status === "active" && (
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 8,
                        paddingTop: 12,
                        borderTopWidth: 1,
                        borderTopColor: theme.colors.divider,
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          backgroundColor: theme.colors.success,
                          borderRadius: 8,
                          paddingVertical: 8,
                          alignItems: "center",
                          flexDirection: "row",
                          justifyContent: "center",
                          gap: 6,
                        }}
                        onPress={() => handleAlertAction(alert.id, "resolve")}
                      >
                        <CheckCircle2 size={16} color="#FFFFFF" strokeWidth={1.5} />
                        <Text
                          style={{
                            fontFamily: "Inter_500Medium",
                            fontSize: 12,
                            color: "#FFFFFF",
                          }}
                        >
                          Mark Resolved
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          flex: 1,
                          backgroundColor: theme.colors.buttonBackground,
                          borderRadius: 8,
                          paddingVertical: 8,
                          alignItems: "center",
                          flexDirection: "row",
                          justifyContent: "center",
                          gap: 6,
                        }}
                        onPress={() => handleAlertAction(alert.id, "dismiss")}
                      >
                        <XCircle size={16} color={theme.colors.text} strokeWidth={1.5} />
                        <Text
                          style={{
                            fontFamily: "Inter_500Medium",
                            fontSize: 12,
                            color: theme.colors.text,
                          }}
                        >
                          Dismiss
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}

          {filteredAlerts.length === 0 && (
            <View
              style={{
                alignItems: "center",
                paddingVertical: 48,
              }}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: theme.colors.buttonBackground,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Bell size={28} color={theme.colors.textSecondary} strokeWidth={1.5} />
              </View>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color: theme.colors.text,
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                No alerts found
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                You're all caught up!{"\n"}We'll notify you of any new safety updates
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}