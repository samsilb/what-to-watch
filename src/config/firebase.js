import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDIXyjwLJcmI29wv4pOg-8_JGB_ruWQYV8",
  authDomain: "movie-rec-hack.firebaseapp.com",
  projectId: "movie-rec-hack",
  storageBucket: "movie-rec-hack.firebasestorage.app",
  messagingSenderId: "626472294815",
  appId: "1:626472294815:web:ee4b42d6ca968b964645aa",
  measurementId: "G-3RVV0THN9E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage for persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore database
export const db = getFirestore(app);

export default app;
