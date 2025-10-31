import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { User, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/utils/useTheme';

export default function TopNavbar({ title = 'Saheli' }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.background,
        paddingTop: Platform.OS === 'web' ? 16 : insets.top + 8,
        paddingBottom: 12,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
      }}
    >
      {/* Profile Icon - Left */}
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/profile')}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: theme.colors.elevated,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        data-testid="profile-nav-button"
      >
        <User size={20} color={theme.colors.text} strokeWidth={2} />
      </TouchableOpacity>

      {/* Title - Center */}
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 18,
          color: theme.colors.text,
          flex: 1,
          textAlign: 'center',
          marginHorizontal: 16,
        }}
      >
        {title}
      </Text>

      {/* Bell Icon - Right */}
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/alerts')}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: theme.colors.elevated,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        data-testid="alerts-nav-button"
      >
        <Bell size={20} color={theme.colors.text} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}
