// Configuration Firebase pour INSPC
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAPM8xkbchZo2IsKfQAWsjn97Pr1qib_rY",
  authDomain: "gpersinspc.firebaseapp.com",
  projectId: "gpersinspc",
  storageBucket: "gpersinspc.firebasestorage.app",
  messagingSenderId: "67137629130",
  appId: "1:67137629130:web:4b71923ab6259fecd6fd33",
  measurementId: "G-JMHGSR1YG1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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
    console.error('Firebase signIn error:', error);
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    await auth.signOut();
    return { error: null };
  } catch (error: any) {
    console.error('Firebase signOut error:', error);
    return { error };
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

// Fonction pour créer un utilisateur de test
export const createTestUser = async () => {
  const { createUserWithEmailAndPassword } = await import('firebase/auth');
  const { doc, setDoc } = await import('firebase/firestore');
  
  try {
    // Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      'admin@inspc.mg', 
      'password123'
    );
    
    // Créer le document personnel dans Firestore
    await setDoc(doc(db, 'personnel', userCredential.user.uid), {
      nom: 'ADMIN',
      prenoms: 'Système',
      email: 'admin@inspc.mg',
      role: 'admin',
      service: 'Administration',
      actif: true,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    console.log('Utilisateur de test créé avec succès');
    return { success: true };
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'utilisateur de test:', error);
    return { success: false, error };
  }
};

export default app;