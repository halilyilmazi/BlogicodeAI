import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (user: User, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async (u: User, t: string) => {
    await AsyncStorage.setItem('token', t);
    await AsyncStorage.setItem('user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (u: User) => {
    setUser(u);
    AsyncStorage.setItem('user', JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
