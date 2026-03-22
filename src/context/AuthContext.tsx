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
    const userId = localStorage.getItem('user_id');
    const userRole = localStorage.getItem('user_role');
    const userName = localStorage.getItem('user_name');
    const company = localStorage.getItem('company');

    if (userId && userRole) {
      setUser({
        id: userId,
        role: userRole as User['role'],
        full_name: userName || '',
        company_name: company || '',
        phone: '', 
      });
    }
    setLoading(false);
  }, []);

  const login = async (phone: string, password: string) => {
    const loginRes = await api.post('/auth/login', { phone, password });
    const userId = loginRes.data.user;

    const profileRes = await api.get(`/users/${userId}`);
    const profileData: User = profileRes.data;

    localStorage.setItem('user_id', profileData.id);
    localStorage.setItem('user_role', profileData.role);
    localStorage.setItem('user_name', profileData.full_name);
    localStorage.setItem('company', profileData.company_name);

    setUser(profileData);
  };

  const signup = async (data: any) => {
    await api.post('/auth/signup', data);
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

// THIS IS THE PART IT WAS COMPLAINING ABOUT MISSING!
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};