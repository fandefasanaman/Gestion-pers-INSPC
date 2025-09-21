import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { Personnel } from '../types';

interface AuthContextType {
  user: User | null;
  personnel: Personnel | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
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
      // Pour l'instant, utiliser des données mock
      // TODO: Implémenter la recherche dans Firestore
      const mockPersonnel = {
        id: '1',
        nom: 'ADMIN',
        prenoms: 'Système',
        email: email,
        role: 'admin',
        service: 'Administration',
        actif: true
      };
      setPersonnel(mockPersonnel);
    } catch (error) {
      console.error('Erreur lors de la récupération du personnel:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { data: { user: userCredential.user }, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setPersonnel(null);
  };

  return (
    <AuthContext.Provider value={{ user, personnel, loading, signIn, signOut }}>
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