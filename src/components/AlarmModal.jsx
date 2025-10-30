import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
  Dimensions,
} from "react-native";
import { AlertTriangle, X } from "lucide-react-native";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { Asset } from "expo-asset";

const { width } = Dimensions.get("window");

export default function AlarmModal({ visible, onClose }) {
  const [sound, setSound] = useState(null);
  const flashAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      startAlarm();
      startAnimations();
    } else {
      stopAlarm();
    }

    return () => {
      stopAlarm();
    };
  }, [visible]);

  const startAlarm = async () => {
    try {
      // Set audio mode to maximum volume and override silent mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      // Load alarm using proper Expo asset loading for Expo Go compatibility
      const alarmAsset = Asset.fromModule(require('../../assets/audio/alarm.mp3'));
      await alarmAsset.downloadAsync();
      
      const { sound: alarmSound } = await Audio.Sound.createAsync(
        { uri: alarmAsset.localUri || alarmAsset.uri },
        { 
          shouldPlay: true, 
          isLooping: true, 
          volume: 1.0 // Maximum volume
        }
      );
      
      // Set to maximum volume
      await alarmSound.setVolumeAsync(1.0);
      setSound(alarmSound);
      console.log('✅ Alarm playing successfully');

      // Start vibration pattern (vibrate 500ms, pause 200ms, repeat)
      Vibration.vibrate([500, 200], true);
    } catch (error) {
      console.log("Error starting alarm:", error);
      // Fallback: try direct require
      try {
        const { sound: alarmSound } = await Audio.Sound.createAsync(
          require('../../assets/audio/alarm.mp3'),
          { 
            shouldPlay: true, 
            isLooping: true, 
            volume: 1.0
          }
        );
        await alarmSound.setVolumeAsync(1.0);
        setSound(alarmSound);
        Vibration.vibrate([500, 200], true);
        console.log('✅ Alarm playing with fallback method');
      } catch (fallbackError) {
        console.log("Fallback alarm error:", fallbackError);
      }
    }
  };

  const stopAlarm = async () => {
    try {
      Vibration.cancel();
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
    } catch (error) {
      console.log("Error stopping alarm:", error);
    }
  };

  const startAnimations = () => {
    // Flashing effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Scale pulse effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleStop = () => {
    stopAlarm();
    onClose();
  };

  const backgroundColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#DC143C", "#FF0000"],
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={handleStop}
    >
      <Animated.View style={[styles.container, { backgroundColor }]}>
        <LinearGradient
          colors={["#DC143C", "#8B0000", "#DC143C"]}
          style={styles.gradient}
        >
          {/* Warning Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <AlertTriangle size={120} color="#FFFFFF" strokeWidth={2.5} />
          </Animated.View>

          {/* Alarm Text */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>EMERGENCY ALARM</Text>
            <Text style={styles.subtitle}>LOUD SIREN ACTIVE</Text>
            <Text style={styles.description}>
              This alarm is playing at maximum volume to attract attention
            </Text>
          </View>

          {/* Visual Flash Indicator */}
          <View style={styles.flashIndicators}>
            <Animated.View
              style={[
                styles.flashCircle,
                {
                  opacity: flashAnim,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.flashCircle,
                {
                  opacity: flashAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0],
                  }),
                },
              ]}
            />
          </View>

          {/* Stop Button */}
          <TouchableOpacity
            style={styles.stopButton}
            onPress={handleStop}
            activeOpacity={0.8}
            data-testid="stop-alarm-button"
          >
            <X size={32} color="#DC143C" strokeWidth={3} />
            <Text style={styles.stopButtonText}>STOP ALARM</Text>
          </TouchableOpacity>

          {/* Warning Message */}
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ This alarm will continue until you stop it
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 48,
    padding: 32,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 1,
  },
  description: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 32,
  },
  flashIndicators: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 48,
  },
  flashCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  stopButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 48,
    paddingVertical: 20,
    borderRadius: 50,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    gap: 12,
  },
  stopButtonText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#DC143C",
    letterSpacing: 1,
  },
  warningBox: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  warningText: {
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "500",
  },
});