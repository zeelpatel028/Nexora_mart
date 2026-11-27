/**
 * Authentication Service
 * Manages user authentication, token storage, and registration flows
 */
import { API_ENDPOINTS } from '../constants';
import {
  request,
  setStoredToken,
  getStoredToken,
  setStoredRefreshToken,
  getStoredRefreshToken,
  clearStoredAuth
} from './api';

const USER_KEY = 'nmart_auth_user';

export const authService = {
  /**
   * Login user with email & password via FastAPI backend
   */
  async login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const data = await request(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email: normalizedEmail, password })
    });
    const accessToken = data?.access_token || data?.token;
    if (accessToken) {
      setStoredToken(accessToken);
    }
    if (data?.refresh_token) {
      setStoredRefreshToken(data.refresh_token);
    }
    if (data?.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    return data;
  },

  /**
   * Register a new store / merchant account via FastAPI backend
   */
  async register(registrationData) {
    const { confirmPassword: _confirmPassword, ...payload } = registrationData;
    const normalizedEmail = payload.email?.trim().toLowerCase();
    const data = await request(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify({
        firstName: payload.firstName?.trim(),
        surname: payload.surname?.trim(),
        email: normalizedEmail,
        phone: payload.phone?.trim(),
        storeType: payload.storeType?.trim(),
        password: payload.password
      })
    });
    const accessToken = data?.access_token || data?.token;
    if (accessToken) {
      setStoredToken(accessToken);
    }
    if (data?.refresh_token) {
      setStoredRefreshToken(data.refresh_token);
    }
    if (data?.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    return data;
  },

  /**
   * Fetch current authenticated merchant profile from FastAPI backend (/api/auth/me)
   */
  async getProfile() {
    try {
      const user = await request(API_ENDPOINTS.AUTH.ME, {
        method: 'GET'
      });
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
      return user;
    } catch (err) {
      if (err.status === 401) {
        clearStoredAuth();
        throw err;
      }
      // Only fall back to cached user on transient network outage (status 0)
      if (err.status === 0) {
        const stored = this.getCurrentUser();
        if (stored) return stored;
      }
      throw err;
    }
  },

  /**
   * Send password reset request / OTP
   */
  async forgotPassword(email) {
    const normalizedEmail = email.trim().toLowerCase();
    return await request(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email: normalizedEmail })
    });
  },

  /**
   * Verify 6-digit OTP
   */
  async verifyOtp(email, otp) {
    const normalizedEmail = email.trim().toLowerCase();
    return await request(API_ENDPOINTS.AUTH.VERIFY_OTP, {
      method: 'POST',
      body: JSON.stringify({ email: normalizedEmail, otp: otp.trim() })
    });
  },

  /**
   * Reset user password with verified OTP
   */
  async resetPassword(email, otp, newPassword) {
    const normalizedEmail = email.trim().toLowerCase();
    return await request(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email: normalizedEmail, otp: otp.trim(), newPassword })
    });
  },

  /**
   * Update authenticated merchant personal profile & password
   */
  async updateProfile(profileData) {
    const user = await request(API_ENDPOINTS.AUTH.UPDATE_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    return user;
  },

  /**
   * Social OAuth login simulation
   */
  async socialLogin(provider = 'Google') {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const mockUser = {
      id: Date.now(),
      email: `user.${Date.now().toString().slice(-4)}@gmail.com`,
      name: `${provider} Nexora User`,
      firstName: provider,
      surname: 'User',
      storeType: 'General Retail',
      provider
    };
    const mockToken = `mock_oauth_${provider.toLowerCase()}_${Date.now()}`;
    setStoredToken(mockToken);
    localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
    return { success: true, user: mockUser, token: mockToken };
  },

  /**
   * Sign out current user
   */
  async logout() {
    try {
      const refreshToken = getStoredRefreshToken();
      await request(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken })
      }).catch(() => {});
    } finally {
      clearStoredAuth();
    }
  },

  /**
   * Get currently active session user from localStorage
   */
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return Boolean(getStoredToken());
  }
};

export default authService;
