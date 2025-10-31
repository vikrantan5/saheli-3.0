import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { auth } from '@/config/firebaseConfig';
import { getUserDetails } from '@/services/userService';

export default function AdminLayout() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.replace('/(auth)/login');
        return;
      }

      const userDetails = await getUserDetails(user.uid);
      if (userDetails?.role === 'admin') {
        setIsAdmin(true);
      } else {
        // Not an admin, redirect to main app
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
        <Text style={styles.loadingText}>Verifying admin access...</Text>
      </View>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ec4899',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="products"
        options={{
          title: 'Manage Products',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="add-product"
        options={{
          title: 'Add New Product',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="edit-product"
        options={{
          title: 'Edit Product',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="orders"
        options={{
          title: 'All Orders',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="manage-videos"
        options={{
          title: 'Manage Videos',
          headerShown: true,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
});