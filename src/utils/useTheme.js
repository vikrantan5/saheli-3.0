import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  
  const theme = {
    isDark: colorScheme === 'dark',
    colors: {
      // Background colors
      background: colorScheme === 'dark' ? '#121212' : '#FFFFFF',
      surface: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
      elevated: colorScheme === 'dark' ? '#262626' : '#F5F5F5',
      
      // Text colors
      text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
      textSecondary: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : '#9A9A9A',
      textTertiary: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : '#666666',
      
      // Border colors
      border: colorScheme === 'dark' ? '#2A2A2A' : '#E6E6E6',
      borderLight: colorScheme === 'dark' ? '#1A1A1A' : '#F2F2F2',
      divider: colorScheme === 'dark' ? '#2A2A2A' : '#EFEFEF',
      
      // Button colors
      buttonBackground: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5',
      buttonText: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
      
      // Card backgrounds
      cardBackground: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
      
      // Status bar
      statusBar: colorScheme === 'dark' ? 'light' : 'dark',
      
      // Tab bar
      tabBarBackground: colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF',
      tabBarBorder: colorScheme === 'dark' ? '#2A2A2A' : '#E5E7EB',
      tabBarActive: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
      tabBarInactive: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : '#6B6B6B',
      
      // Special colors (these remain mostly the same but slightly adjusted)
      success: colorScheme === 'dark' ? '#4ADE80' : '#25B869',
      error: colorScheme === 'dark' ? '#F87171' : '#E04444',
      warning: colorScheme === 'dark' ? '#FBBF24' : '#F59E0B',
      
      // Safety app specific colors
      danger: '#FF4444',
      emergency: '#DC2626',
      safe: '#10B981', 
      
      // Notification colors
      notification: colorScheme === 'dark' ? '#EF4444' : '#E04444',
      notificationDot: colorScheme === 'dark' ? '#FF4444' : '#FF2D55',
      
      // Disabled states
      disabled: colorScheme === 'dark' ? '#3A3A3A' : '#E6E6E6',
      disabledText: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#9A9A9A',
    }
  };
  
  return theme;
};