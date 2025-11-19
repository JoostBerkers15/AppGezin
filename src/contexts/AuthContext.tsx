import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('gezin-app-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    const envUsername = process.env.REACT_APP_USERNAME;
    const envPassword = process.env.REACT_APP_PASSWORD;

    console.log('=== LOGIN DEBUG ===');
    console.log('Ingevoerde username:', username);
    console.log('Ingevoerde password:', password);
    console.log('Verwachte username uit .env:', envUsername);
    console.log('Verwachte password uit .env:', envPassword);
    console.log('Username match:', username === envUsername);
    console.log('Password match:', password === envPassword);
    console.log('==================');

    if (username === envUsername && password === envPassword) {
      const userData: User = {
        username,
        isAuthenticated: true
      };
      setUser(userData);
      localStorage.setItem('gezin-app-user', JSON.stringify(userData));
      console.log('✅ Login successful! User state updated.');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gezin-app-user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: user?.isAuthenticated || false
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};







