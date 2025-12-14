import { FirebaseApp, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyB7JnGdGGjcoFN3gR8XPVu4nYpVSORuVnA",
  authDomain: "myconnect-f2af8.firebaseapp.com",
  projectId: "myconnect-f2af8",
  storageBucket: "myconnect-f2af8.appspot.com",
  messagingSenderId: "191922075446",
  appId: "1:191922075446:web:72ab430046b40d39e22597",
  measurementId: "G-8Q1N0TGXLZ",
};

// ✅ Singleton Firebase app instance
let firebaseApp: FirebaseApp | null = null;

export const getFirebaseApp = (): FirebaseApp => {
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
  }
  return firebaseApp;
};

export default getFirebaseApp;
