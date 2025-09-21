import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, db, signIn as firebaseSignIn, signOut as firebaseSignOut } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface Personnel {
  id: string;
  nom: string;
  prenoms: string;
  email: string;
  role: 'admin' | 'hr' | 'service_chief' | 'employee';
  service: string;
  actif: boolean;
}

interface AuthContextType {
  user: User | null;
  personnel: Personnel | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [personnel, setPersonnel] = useState<Personnel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth changes with Firebase
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user && user.email) {
        await fetchPersonnel(user.email);
      } else {
        setPersonnel(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchPersonnel = async (email: string) => {
    try {
      // Rechercher le personnel dans Firestore par email
      const personnelQuery = query(
        collection(db, 'personnel'),
        where('email', '==', email)
      );
      
      const querySnapshot = await getDocs(personnelQuery);
      
      if (!querySnapshot.empty) {
        const personnelDoc = querySnapshot.docs[0];
        const personnelData = personnelDoc.data() as Personnel;
        setPersonnel({
          id: personnelDoc.id,
          ...personnelData
        });
      } else {
        // Si aucun personnel trouvé, créer un utilisateur admin par défaut
        const defaultPersonnel: Personnel = {
          id: user?.uid || '1',
          nom: 'ADMIN',
          prenoms: 'Système',
          email: email,
          role: 'admin',
          service: 'Administration',
          actif: true
        };
        setPersonnel(defaultPersonnel);
      }
    } catch (error) {
      console.warn('Impossible de récupérer les données du personnel depuis Firestore. Utilisation des données par défaut.', error);
      // En cas d'erreur, utiliser des données par défaut
      const defaultPersonnel: Personnel = {
        id: user?.uid || '1',
        nom: 'ADMIN',
        prenoms: 'Système',
        email: email,
        role: 'admin',
        service: 'Administration',
        actif: true
      };
      setPersonnel(defaultPersonnel);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await firebaseSignIn(email, password);
      return result;
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setPersonnel(null);
  };

  return (
    <AuthContext.Provider value={{ user, personnel, loading, login, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}