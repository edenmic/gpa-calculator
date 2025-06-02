// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// ⚠️ IMPORTANT: Replace these values with your own Firebase project configuration!
// The values below are example values and should be replaced with your actual Firebase project details.
// Get your config from: Firebase Console > Project Settings > General > Your apps

// Debug: Log environment variables to check if they're loaded
console.log('Environment variables check:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? 'Found' : 'Missing',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? 'Found' : 'Missing',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'Found' : 'Missing',
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBNNLBpHs-53fVJw9Lpt4xyw_8qWt4OwOY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gpacalculator-ef602.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gpacalculator-ef602",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gpacalculator-ef602.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "192888248882",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:192888248882:web:e7417b992e498089a7ba2b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
