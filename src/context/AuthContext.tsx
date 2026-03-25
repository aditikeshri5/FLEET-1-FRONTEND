import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (phone: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Try to get the complete user object from memory
    const savedUser = localStorage.getItem('fleet_user_data');
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (phone: string, password: string) => {
    // 2. The backend /login now returns ID, Role, and ALL address fields
    const loginRes = await api.post('/auth/login', { phone, password });
    const userData: User = loginRes.data;

    // 3. Save EVERYTHING so the auto-fill has data to work with
    localStorage.setItem('user_id', userData.id);
    localStorage.setItem('fleet_user_data', JSON.stringify(userData));

    setUser(userData);
  };

  const signup = async (data: any) => {
    await api.post('/auth/signup', data);
    // Auto-login after signup to fetch the profile
    await login(data.phone, data.password);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};