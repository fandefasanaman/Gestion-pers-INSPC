import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock authentication - replace with Supabase in production
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@inspc.mg',
    firstName: 'Administrator',
    lastName: 'INSPC',
    role: 'admin',
    service: 'Administration',
    position: 'Administrateur Système',
    registrationNumber: 'ADM001',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'rh@inspc.mg',
    firstName: 'Marie',
    lastName: 'RAKOTO',
    role: 'hr',
    service: 'Ressources Humaines',
    position: 'Responsable RH',
    registrationNumber: 'RH001',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    email: 'chef.medical@inspc.mg',
    firstName: 'Dr. Jean',
    lastName: 'ANDRIANO',
    role: 'service_chief',
    service: 'Service Médical',
    position: 'Chef de Service',
    registrationNumber: 'MED001',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    email: 'employe@inspc.mg',
    firstName: 'Hery',
    lastName: 'RASOLOFO',
    role: 'employee',
    service: 'Service Médical',
    position: 'Technicien',
    registrationNumber: 'MED002',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth
    const storedUser = localStorage.getItem('inspc_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    // Mock authentication
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === 'password') {
      setUser(foundUser);
      localStorage.setItem('inspc_user', JSON.stringify(foundUser));
    } else {
      throw new Error('Invalid credentials');
    }
    
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('inspc_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};