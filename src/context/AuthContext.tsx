import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, TeamId } from '../types.ts';
import { api, setStoredToken, getStoredToken } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  teamId: TeamId | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  register: (payload: { name: string; email: string; password: string; phone?: string; teamId: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (payload: { name?: string; avatarUrl?: string }) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.getMe();
      setUser(data.user);
    } catch (err) {
      console.warn('Session expired or invalid:', err);
      setStoredToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, pass: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await api.login(email, pass);
      setStoredToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: { name: string; email: string; password: string; phone?: string; teamId: string }) => {
    await api.register(payload);
  };

  const updateProfile = async (payload: { name?: string; avatarUrl?: string }): Promise<User> => {
    const res = await api.updateProfile(payload);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    setStoredToken(null);
    setUser(null);
  };

  const role = user ? user.role : null;
  const teamId = user ? user.teamId : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        teamId,
        loading,
        login,
        register,
        updateProfile,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
