import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Store, LoginPayload, RegisterPayload, AuthResponse } from '../../api/types';
import Endpoints from '../../api/endpoints';
import storage from '../../api/storage';
import apiClient from '../../api/apiClient';

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

  const fetchMeAndStore = useCallback(async (): Promise<User | null> => {
    const me = await apiClient.get<User>(Endpoints.AUTH.ME);
    if (me) {
      await storage.setUser(me);
      if ((me as any).store) {
        await storage.setStore((me as any).store);
        setStore((me as any).store);
      }
    }
    return me;
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      setIsLoading(true);
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
        if (savedUser) setUser(savedUser);
        if (savedStore) setStore(savedStore);

        try {
          const freshUser = await fetchMeAndStore();
          if (freshUser) setUser(freshUser);
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
  }, [fetchMeAndStore]);

  useEffect(() => {
    restoreSession();
    apiClient.setOnUnauthorized(() => {
      setToken(null);
      setUser(null);
      setStore(null);
    });
  }, [restoreSession]);

  const persistAuthResponse = async (res: AuthResponse) => {
    const jwt = res.access_token || res.token || null;
    if (jwt) {
      await storage.setAuthToken(jwt);
      await storage.setSessionExpiresAt(Date.now() + 15 * 60 * 60 * 1000);
    }
    if (res.refresh_token) await storage.setRefreshToken(res.refresh_token);
    if (res.user) await storage.setUser(res.user);
    if (res.store) await storage.setStore(res.store);
    setToken(jwt);
    setUser(res.user);
    if (res.store) setStore(res.store);
  };

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post<AuthResponse>(Endpoints.AUTH.LOGIN, payload);
      await persistAuthResponse(res);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post<AuthResponse>(Endpoints.AUTH.REGISTER, payload);
      await persistAuthResponse(res);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      try {
        await apiClient.post(Endpoints.AUTH.LOGOUT);
      } catch {}
      await storage.clearAuth();
    } finally {
      setToken(null);
      setUser(null);
      setStore(null);
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const freshUser = await fetchMeAndStore();
      if (freshUser) setUser(freshUser);
    } catch {}
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
