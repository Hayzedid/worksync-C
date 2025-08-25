"use client";
import { useEffect, useState, createContext, useContext } from 'react';
import { api } from '../api';

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

const AuthContext = createContext<null | {
  user: User | null;
  loading: boolean;
  refresh: () => void;
}>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await api.get('/users/profile');
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 