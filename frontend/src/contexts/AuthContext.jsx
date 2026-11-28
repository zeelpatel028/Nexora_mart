import React, { useState, useEffect } from 'react';
import { AuthContext } from './authContextInstance';
import { authService } from '../services';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return authService.getCurrentUser();
    } catch {
      return null;
    }
  });
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const verifySession = async () => {
      if (authService.isAuthenticated()) {
        try {
          const profile = await authService.getProfile();
          if (isMounted && profile) {
            setUser(profile);
          }
        } catch {
          if (isMounted) {
            setUser(null);
          }
        }
      }
      if (isMounted) {
        setIsInitializing(false);
      }
    };
    verifySession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    if (response?.user) {
      setUser(response.user);
    }
    return response;
  };

  const register = async (data) => {
    return await authService.register(data);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const socialLogin = async (provider) => {
    const response = await authService.socialLogin(provider);
    if (response?.user) {
      setUser(response.user);
    }
    return response;
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isInitializing,
    login,
    register,
    logout,
    socialLogin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
