

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyC-VOXIZQ0rw-ivQHChrqxIhxuf4-U9Ep8",
  authDomain: "quizmasterlive-e3037.firebaseapp.com",
  projectId: "quizmasterlive-e3037",
  storageBucket: "quizmasterlive-e3037.firebasestorage.app",
  messagingSenderId: "79614437786",
  appId: "1:79614437786:web:fa4dae520a5b5d30e87223",
  measurementId: "G-VEH493KB5J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export default app;