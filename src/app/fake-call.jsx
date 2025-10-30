import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
  Dimensions,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { Phone, PhoneOff, User } from "lucide-react-native";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { Asset } from "expo-asset";

const { width, height } = Dimensions.get("window");

export default function FakeCallScreen() {
  const [sound, setSound] = useState(null);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Start ringing sound
    playRingtone();
    
    // Start vibration pattern
    const vibrationPattern = [1000, 1000];
    Vibration.vibrate(vibrationPattern, true);

    // Pulse animation for incoming call
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      Vibration.cancel();
      if (sound) {
        sound.stopAsync();
        sound.unloadAsync();
      }
    };
  }, []);

  const playRingtone = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Load ringtone using proper Expo asset loading for Expo Go compatibility
      const ringtoneAsset = Asset.fromModule(require('../../assets/audio/ringtone.mp3'));
      await ringtoneAsset.downloadAsync();
      
      const { sound: ringtone } = await Audio.Sound.createAsync(
        { uri: ringtoneAsset.localUri || ringtoneAsset.uri },
        { shouldPlay: true, isLooping: true, volume: 0.8 }
      );
      setSound(ringtone);
      console.log('✅ Ringtone playing successfully');
    } catch (error) {
      console.log("Error playing ringtone:", error);
      // Fallback: try direct require
      try {
        const { sound: ringtone } = await Audio.Sound.createAsync(
          require('../../assets/audio/ringtone.mp3'),
          { shouldPlay: true, isLooping: true, volume: 0.8 }
        );
        setSound(ringtone);
        console.log('✅ Ringtone playing with fallback method');
      } catch (fallbackError) {
        console.log("Fallback ringtone error:", fallbackError);
      }
    }
  };

  const handleAccept = async () => {
    Vibration.cancel();
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    // Navigate to in-call screen
    router.replace("/in-call");
  };

  const handleDecline = async () => {
    Vibration.cancel();
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    router.back();
  };

  return (
    <LinearGradient
      colors={["#1a1a2e", "#16213e", "#0f3460"]}
      style={styles.container}
    >
      {/* Top Section - Incoming Call Info */}
      <View style={styles.topSection}>
        <Text style={styles.callStatus}>Incoming Call</Text>
        
        <Animated.View
          style={[
            styles.avatarContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <View style={styles.avatar}>
            <User size={80} color="#FFFFFF" strokeWidth={1.5} />
          </View>
        </Animated.View>

        <Text style={styles.callerName}>Mom</Text>
        <Text style={styles.callerNumber}>+1 (555) 123-4567</Text>
        
        <View style={styles.callerDetails}>
          <Text style={styles.callerLabel}>Mobile</Text>
        </View>
      </View>

      {/* Bottom Section - Action Buttons */}
      <View style={styles.bottomSection}>
        <View style={styles.actionButtons}>
          {/* Decline Button */}
          <TouchableOpacity
            style={styles.declineButton}
            onPress={handleDecline}
            activeOpacity={0.8}
            data-testid="decline-call-button"
          >
            <View style={[styles.buttonInner, { backgroundColor: "#DC143C" }]}>
              <PhoneOff size={32} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={styles.buttonLabel}>Decline</Text>
          </TouchableOpacity>

          {/* Accept Button */}
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={handleAccept}
            activeOpacity={0.8}
            data-testid="accept-call-button"
          >
            <View style={[styles.buttonInner, { backgroundColor: "#22C55E" }]}>
              <Phone size={32} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={styles.buttonLabel}>Accept</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.reminderButton}
          onPress={handleDecline}
        >
          <Text style={styles.reminderText}>Remind Me Later</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  topSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  callStatus: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "400",
    marginBottom: 40,
    letterSpacing: 1,
  },
  avatarContainer: {
    marginBottom: 32,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  callerName: {
    fontSize: 36,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  callerNumber: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 16,
  },
  callerDetails: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  callerLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  bottomSection: {
    paddingBottom: 60,
    paddingHorizontal: 40,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 32,
  },
  declineButton: {
    alignItems: "center",
  },
  acceptButton: {
    alignItems: "center",
  },
  buttonInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  buttonLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  reminderButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  reminderText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
});