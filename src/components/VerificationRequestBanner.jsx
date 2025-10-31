import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle, MapPin, X } from 'lucide-react-native';
import { useTheme } from '@/utils/useTheme';

export default function VerificationRequestBanner({ 
  pendingCount, 
  onPress, 
  onDismiss 
}) {
  const theme = useTheme();

  if (pendingCount === 0) return null;

  return (
    <View
      style={[
        styles.container,
        { 
          backgroundColor: theme.colors.warning,
          shadowColor: '#000',
        }
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={onPress}
        activeOpacity={0.8}
        data-testid="verification-banner"
      >
        <View style={styles.iconContainer}>
          <CheckCircle size={20} color="#FFFFFF" strokeWidth={2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            Verification Needed
          </Text>
          <Text style={styles.subtitle}>
            {pendingCount} nearby location{pendingCount > 1 ? 's' : ''} need{pendingCount > 1 ? '' : 's'} your verification
          </Text>
        </View>
        <View style={styles.actionContainer}>
          <MapPin size={16} color="#FFFFFF" strokeWidth={2} />
        </View>
      </TouchableOpacity>
      
      {onDismiss && (
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={onDismiss}
          data-testid="dismiss-verification-banner"
        >
          <X size={16} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  actionContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  dismissButton: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});
