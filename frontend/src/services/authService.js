/**
 * Authentication Service
 * Manages user authentication, token storage, and registration flows
 */
import { API_ENDPOINTS } from '../constants';
import { request, setStoredToken, getStoredToken } from './api';

const USER_KEY = 'nmart_auth_user';

export const authService = {
  /**
   * Login user with email & password via FastAPI backend
   * Falls back to offline demo credentials if backend is not started
   */
  async login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const data = await request(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ email: normalizedEmail, password })
      });
      if (data?.token) {
        setStoredToken(data.token);
      }
      if (data?.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
      return data;
    } catch (networkErr) {
      // If backend is offline, enable seamless demo login for test accounts
      if (networkErr.status === 0 || networkErr.message?.includes('Cannot connect')) {
        if (normalizedEmail === 'demo@nmart.com' && password === 'password123') {
          const mockUser = {
            id: 1,
            email: 'demo@nmart.com',
            name: 'Alex Morgan',
            firstName: 'Alex',
            surname: 'Morgan',
            storeType: 'Supermarket & Grocery'
          };
          const mockToken = `mock_jwt_token_${Date.now()}`;
          setStoredToken(mockToken);
          localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
          return { token: mockToken, tokenType: 'bearer', user: mockUser };
        }
      }
      throw networkErr;
    }
  },

  /**
   * Register a new store / merchant account via FastAPI backend
   */
  async register(registrationData) {
    const { confirmPassword: _confirmPassword, ...payload } = registrationData;
    const normalizedEmail = payload.email?.trim().toLowerCase();
    try {
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
      if (data?.token) {
        setStoredToken(data.token);
      }
      if (data?.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
      return data;
    } catch (networkErr) {
      if (networkErr.status === 0 || networkErr.message?.includes('Cannot connect')) {
        const mockUser = {
          id: Date.now(),
          email: normalizedEmail,
          name: `${payload.firstName} ${payload.surname}`,
          firstName: payload.firstName,
          surname: payload.surname,
          storeType: payload.storeType || 'Retail'
        };
        const mockToken = `mock_jwt_token_${Date.now()}`;
        setStoredToken(mockToken);
        localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
        return { token: mockToken, tokenType: 'bearer', user: mockUser };
      }
      throw networkErr;
    }
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
        this.logout();
      }
      // If running standalone mock token, return cached user
      const stored = this.getCurrentUser();
      if (stored) return stored;
      throw err;
    }
  },

  /**
   * Send password reset request / OTP
   */
  async forgotPassword(email) {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      return await request(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        method: 'POST',
        body: JSON.stringify({ email: normalizedEmail })
      });
    } catch (networkErr) {
      if (networkErr.status === 0 || networkErr.message?.includes('Cannot connect')) {
        return { message: `Password reset instructions and OTP sent to ${normalizedEmail}`, success: true, otp: '123456' };
      }
      throw networkErr;
    }
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
      await request(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST' }).catch(() => {});
    } finally {
      setStoredToken(null);
      try {
        localStorage.removeItem(USER_KEY);
      } catch {
        // Ignore storage error
      }
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
