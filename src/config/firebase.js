
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// TODO: Replace with YOUR Firebase configuration
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

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Auto sign-in anonymously
signInAnonymously(auth)
  .then(() => {
    console.log('✅ Firebase: Signed in anonymously');
  })
  .catch((error) => {
    console.error('❌ Firebase auth error:', error);
  });

export default app;