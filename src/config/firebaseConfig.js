import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyAjQ2V99wxXwrHW8XlOngI6ob3PV7X-0Cc",
  authDomain: "saheli1.firebaseapp.com",
  projectId: "saheli1",
  storageBucket: "saheli1.firebasestorage.app",
  messagingSenderId: "511991995707",
  appId: "1:511991995707:web:bb6e460878c49376e32b1e",
  measurementId: "G-V2EW0GN7H1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with proper persistence based on platform
let auth;
try {
  if (Platform.OS === 'web') {
    auth = getAuth(app);
    // Use browser local persistence for web
    if (typeof window !== 'undefined') {
      auth.setPersistence(browserLocalPersistence);
    }
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
} catch (error) {
  // If auth is already initialized, just get it
  console.log('Auth already initialized, getting existing instance');
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
