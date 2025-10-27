
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebaseConfig';
import { getUserDetails } from '@/services/userService';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function RootLayoutNav() {
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [hasUserDetails, setHasUserDetails] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Check if user has completed their profile
        try {
          const userDetails = await getUserDetails(user.uid);
          setHasUserDetails(!!userDetails);
        } catch (error) {
          console.error('Error fetching user details:', error);
          setHasUserDetails(false);
        }
      } else {
        setHasUserDetails(false);
      }
      
      setIsReady(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/auth/login');
    } else if (user && !hasUserDetails && segments[1] !== 'user-details') {
      // Redirect to user details if authenticated but profile incomplete
      router.replace('/auth/user-details');
    } else if (user && hasUserDetails && inAuthGroup) {
      // Redirect to home if authenticated and profile complete
      router.replace('/(tabs)');
    }
  }, [user, hasUserDetails, segments, isReady]);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/register" />
      <Stack.Screen name="auth/user-details" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="fake-call" />
      <Stack.Screen name="in-call" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootLayoutNav />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
