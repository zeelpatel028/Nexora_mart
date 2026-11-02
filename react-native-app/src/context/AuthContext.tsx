/**
 * Authentication Context & Session Provider
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, LoginPayload, RegisterPayload } from '../models/types';
import authService from '../services/authService';
import storage from '../utils/storage';
import apiClient from '../api/apiClient';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auto-restore session from storage
  const restoreSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const savedToken = await storage.getAuthToken();
      const savedUser = await storage.getUser();

      if (savedToken) {
        setToken(savedToken);
        if (savedUser) {
          setUser(savedUser);
        }

        // Verify token with backend /auth/me
        try {
          const freshUser = await authService.getMe();
          if (freshUser) {
            setUser(freshUser);
          }
        } catch (err: any) {
          // If token expired or invalid (401), clean up
          if (err.status === 401) {
            await storage.removeAuthToken();
            await storage.removeUser();
            setToken(null);
            setUser(null);
          }
        }
      }
    } catch (e) {
      console.warn('Session restoration failed:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();

    // Register 401 unauthorized callback
    apiClient.setOnUnauthorized(() => {
      setToken(null);
      setUser(null);
    });
  }, [restoreSession]);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const res = await authService.login(payload);
      const jwtToken = res.token || res.access_token || null;
      setToken(jwtToken);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const res = await authService.register(payload);
      const jwtToken = res.token || res.access_token || null;
      setToken(jwtToken);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const freshUser = await authService.getMe();
      if (freshUser) {
        setUser(freshUser);
      }
    } catch {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;

