'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('ecu_forge_token');
    const savedUser = localStorage.getItem('ecu_forge_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('ecu_forge_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password: pass });
      if (res.data.success) {
        const { user: apiUser, token: apiToken } = res.data.data;
        const normalizedUser: User = {
          id: apiUser.id,
          full_name: apiUser.name || apiUser.full_name,
          email: apiUser.email,
          role: apiUser.role,
          status: apiUser.isActive ? 'active' : 'inactive',
          created_at: new Date().toISOString(),
        };
        setUser(normalizedUser);
        setToken(apiToken);
        localStorage.setItem('ecu_forge_token', apiToken);
        localStorage.setItem('ecu_forge_user', JSON.stringify(normalizedUser));
        return;
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { full_name: name, email, password: pass });
      if (res.data.success) {
        const { user: apiUser, token: apiToken } = res.data.data;
        const normalizedUser: User = {
          id: apiUser.id,
          full_name: apiUser.name || apiUser.full_name,
          email: apiUser.email,
          role: apiUser.role,
          status: apiUser.isActive ? 'active' : 'inactive',
          created_at: new Date().toISOString(),
        };
        setUser(normalizedUser);
        setToken(apiToken);
        localStorage.setItem('ecu_forge_token', apiToken);
        localStorage.setItem('ecu_forge_user', JSON.stringify(normalizedUser));
        return;
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ecu_forge_token');
    localStorage.removeItem('ecu_forge_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
