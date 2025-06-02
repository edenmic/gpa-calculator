// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBNNLBpHs-53fVJw9Lpt4xyw_8qWt4OwOY",
  authDomain: "gpacalculator-ef602.firebaseapp.com",
  projectId: "gpacalculator-ef602",
  storageBucket: "gpacalculator-ef602.firebasestorage.app",
  messagingSenderId: "192888248882",
  appId: "1:192888248882:web:e7417b992e498089a7ba2b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
