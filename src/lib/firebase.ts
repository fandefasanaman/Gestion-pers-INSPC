// Configuration Firebase pour INSPC
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Configuration Firebase INSPC (fournie)
const firebaseConfig = {
  apiKey: "AIzaSyAPM8xkbchZo2IsKfQAWsjn97Pr1qib_rY",
  authDomain: "gpersinspc.firebaseapp.com", 
  projectId: "gpersinspc",
  storageBucket: "gpersinspc.firebasestorage.app",
  messagingSenderId: "67137629130",
  appId: "1:67137629130:web:4b71923ab6259fecd6fd33",
  measurementId: "G-JMHGSR1YG1"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Exporter les services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Fonctions d'authentification
export const signIn = async (email: string, password: string) => {
  const { signInWithEmailAndPassword } = await import('firebase/auth');
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { data: { user: userCredential.user }, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    await auth.signOut();
    return { error: null };
  } catch (error: any) {
    return { error };
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export default app;