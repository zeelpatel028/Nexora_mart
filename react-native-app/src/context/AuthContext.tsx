/**
 * Authentication Context & Session Provider
 * Manages access token (15 min), refresh session (15 hour), user profile, and active store context.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Store, LoginPayload, RegisterPayload } from '../models/types';
import authService from '../services/authService';
import storage from '../utils/storage';
import apiClient from '../api/apiClient';

interface AuthContextType {
  user: User | null;
  store: Store | null;
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
  const [store, setStore] = useState<Store | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auto-restore session from storage
  const restoreSession = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check 15-hour absolute session validity
      const sessionExpiresAt = await storage.getSessionExpiresAt();
      if (sessionExpiresAt && Date.now() > sessionExpiresAt) {
        await storage.clearAuth();
        setToken(null);
        setUser(null);
        setStore(null);
        return;
      }

      const savedToken = await storage.getAuthToken();
      const savedUser = await storage.getUser();
      const savedStore = await storage.getStore();

      if (savedToken) {
        setToken(savedToken);
        if (savedUser) {
          setUser(savedUser);
        }
        if (savedStore) {
          setStore(savedStore);
        }

        // Verify token with backend /auth/me
        try {
          const freshUser = await authService.getMe();
          if (freshUser) {
            setUser(freshUser);
            const freshStore = await storage.getStore();
            if (freshStore) {
              setStore(freshStore);
            }
          }
        } catch (err: any) {
          if (err.status === 401) {
            await storage.clearAuth();
            setToken(null);
            setUser(null);
            setStore(null);
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
      setStore(null);
    });
  }, [restoreSession]);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const res = await authService.login(payload);
      const jwtToken = res.access_token || res.token || null;
      setToken(jwtToken);
      setUser(res.user);
      if (res.store) {
        setStore(res.store);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const res = await authService.register(payload);
      const jwtToken = res.access_token || res.token || null;
      setToken(jwtToken);
      setUser(res.user);
      if (res.store) {
        setStore(res.store);
      }
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
      setStore(null);
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const freshUser = await authService.getMe();
      if (freshUser) {
        setUser(freshUser);
        const freshStore = await storage.getStore();
        if (freshStore) {
          setStore(freshStore);
        }
      }
    } catch {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        store,
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
