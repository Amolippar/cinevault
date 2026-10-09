import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiClient } from '../api/client';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, confirmPassword?: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('cinevault_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await apiClient.get('/auth/me');
        setUser(res.data.data);
      } catch (err) {
        console.error('Failed to load user session', err);
        localStorage.removeItem('cinevault_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { user: userData, token: jwtToken } = res.data.data;
      
      localStorage.setItem('cinevault_token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
      success(`Welcome back, ${userData.name}!`);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Login failed. Please check your credentials.';
      error(msg);
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    confirmPassword?: string
  ): Promise<boolean> => {
    try {
      const res = await apiClient.post('/auth/register', {
        name,
        email,
        password,
        confirmPassword,
      });
      const { user: userData, token: jwtToken } = res.data.data;

      localStorage.setItem('cinevault_token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
      success(`Welcome to CineVault, ${userData.name}! Your account is ready.`);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      error(msg);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('cinevault_token');
    setToken(null);
    setUser(null);
    success('You have been logged out.');
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedData });
    }
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
