import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjQ2V99wxXwrHW8XlOngI6ob3PV7X-0Cc",
  authDomain: "saheli1.firebaseapp.com",
  projectId: "saheli1",
  storageBucket: "saheli1.firebasestorage.app",
  messagingSenderId: "511991995707",
  appId: "1:511991995707:web:bb6e460878c49376e32b1e",
  measurementId: "G-V2EW0GN7H1"
};

// Initialize Firebase App (only once)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
} else {
  app = getApp();
  console.log('Using existing Firebase app instance');
}

// Initialize Auth with robust error handling
let auth;
try {
  // For React Native (Android/iOS), use AsyncStorage persistence
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
      console.log('Firebase Auth initialized for React Native with AsyncStorage');
    } catch (error) {
      // If already initialized, get the existing instance
      if (error.code === 'auth/already-initialized') {
        auth = getAuth(app);
        console.log('Using existing Firebase Auth instance');
      } else {
        throw error;
      }
    }
  } else {
    // For web platform
    auth = getAuth(app);
    console.log('Firebase Auth initialized for Web');
  }
} catch (error) {
  console.error('Firebase Auth initialization error:', error);
  // Fallback: try to get existing auth instance
  try {
    auth = getAuth(app);
    console.log('Fallback: Retrieved existing Auth instance');
  } catch (fallbackError) {
    console.error('Fatal: Could not initialize Firebase Auth:', fallbackError);
    throw new Error('Firebase Authentication could not be initialized. Please check your Firebase configuration.');
  }
}

// Initialize Firestore with React Native optimized settings
let db;
try {
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    // For React Native: Initialize with offline persistence and cache settings
    db = initializeFirestore(app, {
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
      experimentalForceLongPolling: true // Use long polling for better mobile compatibility
    });
    console.log('Firestore initialized for React Native with offline support');
  } else {
    // For Web: Use standard initialization
    db = getFirestore(app);
    console.log('Firestore initialized for Web');
  }
} catch (error) {
  // If Firestore is already initialized, get existing instance
  if (error.code === 'failed-precondition') {
    db = getFirestore(app);
    console.log('Using existing Firestore instance');
  } else {
    console.error('Firestore initialization error:', error);
    console.error('Please make sure Firestore is enabled in Firebase Console:');
    console.error('1. Go to Firebase Console > Firestore Database');
    console.error('2. Click "Create database"');
    console.error('3. Choose "Start in production mode" or "Start in test mode"');
    throw new Error('Firestore could not be initialized. Please enable Firestore Database in Firebase Console.');
  }
}

// Verify auth is properly initialized
if (!auth) {
  throw new Error('Firebase Auth is not initialized. Please check your Firebase Console settings and ensure Email/Password authentication is enabled.');
}

export { auth, db };
export default app;
