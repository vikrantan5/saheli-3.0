import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebaseConfig';
import { getUserDetails } from '@/services/userService';
import { ThemeProvider } from '@/utils/ThemeContext';

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

  // Function to check user details
  const checkUserDetails = async (currentUser) => {
    if (currentUser) {
      try {
        console.log('Checking user details for uid:', currentUser.uid);
        const userDetails = await getUserDetails(currentUser.uid);
        const hasDetails = !!userDetails;
        console.log('User has details:', hasDetails);
        setHasUserDetails(hasDetails);
        return hasDetails;
      } catch (error) {
        console.error('Error fetching user details:', error);
        setHasUserDetails(false);
        return false;
      }
    } else {
      setHasUserDetails(false);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      await checkUserDetails(user);
      setIsReady(true);
    });

    return unsubscribe;
  }, []);

  // Re-check user details when navigating to tabs
  useEffect(() => {
    if (user && segments[0] === '(tabs)' && !hasUserDetails) {
      checkUserDetails(user);
    }
  }, [segments, user]);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    console.log('Navigation check - User:', !!user, 'HasDetails:', hasUserDetails, 'Segments:', segments);

    if (!user && !inAuthGroup) {
      console.log('→ Redirecting to login (no user)');
      router.replace('/(auth)/login');
    } else if (user && !hasUserDetails && segments[1] !== 'user-details') {
      console.log('→ Redirecting to user-details (no profile)');
      router.replace('/(auth)/user-details');
    } else if (user && hasUserDetails && inAuthGroup) {
      console.log('→ Redirecting to dashboard (profile complete)');
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
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="store" />
      <Stack.Screen name="fake-call" />
      <Stack.Screen name="in-call" />
      <Stack.Screen name="geofences" />
      <Stack.Screen name="emergency-contacts" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ThemeProvider>
  );
}