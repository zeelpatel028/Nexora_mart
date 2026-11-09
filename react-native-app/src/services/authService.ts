/**
 * Authentication & Merchant Session Service
 * Manages 15-minute access JWT, 15-hour refresh sessions, and profile synchronization.
 */
import apiClient from '../api/apiClient';
import Endpoints from '../api/endpoints';
import storage from '../utils/storage';
import { AuthResponse, LoginPayload, RegisterPayload, User, StoreType } from '../models/types';

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>(Endpoints.AUTH.LOGIN, {
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    });

    const token = res.access_token || res.token;
    if (token) {
      await storage.setAuthToken(token);
    }
    if (res.refresh_token) {
      await storage.setRefreshToken(res.refresh_token);
      // Absolute 15-hour session lifetime:
      const fifteenHoursMs = 15 * 60 * 60 * 1000;
      await storage.setSessionExpiresAt(Date.now() + fifteenHoursMs);
    }
    if (res.user) {
      await storage.setUser(res.user);
    }
    if (res.store) {
      await storage.setStore(res.store);
    }
    return res;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>(Endpoints.AUTH.REGISTER, {
      firstName: payload.firstName ? payload.firstName.trim() : (payload.name?.split(' ')[0] || ''),
      surname: payload.surname ? payload.surname.trim() : (payload.name?.split(' ').slice(1).join(' ') || 'Owner'),
      name: payload.name || `${payload.firstName || ''} ${payload.surname || ''}`.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: (payload.phone || '').trim(),
      storeType: payload.storeType,
      store_type_id: payload.store_type_id,
      store_type_code: payload.store_type_code,
      store_name: payload.store_name,
      password: payload.password,
    });

    const token = res.access_token || res.token;
    if (token) {
      await storage.setAuthToken(token);
    }
    if (res.refresh_token) {
      await storage.setRefreshToken(res.refresh_token);
      const fifteenHoursMs = 15 * 60 * 60 * 1000;
      await storage.setSessionExpiresAt(Date.now() + fifteenHoursMs);
    }
    if (res.user) {
      await storage.setUser(res.user);
    }
    if (res.store) {
      await storage.setStore(res.store);
    }
    return res;
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get<any>(Endpoints.AUTH.ME);
    const user: User = res.user ? { ...res.user, storeType: res.storeType || res.store?.store_type?.name } : res;
    if (user) {
      await storage.setUser(user);
    }
    if (res.store) {
      await storage.setStore(res.store);
    }
    return user;
  },

  async getStoreTypes(activeOnly: boolean = true): Promise<StoreType[]> {
    return apiClient.get<StoreType[]>(Endpoints.STORE_TYPES.LIST, {
      params: { active_only: activeOnly },
    });
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; otp?: string }> {
    return apiClient.post(Endpoints.AUTH.FORGOT_PASSWORD, {
      email: email.trim().toLowerCase(),
    });
  },

  async verifyOtp(email: string, otp: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post(Endpoints.AUTH.VERIFY_OTP, {
      email: email.trim().toLowerCase(),
      otp: otp.trim(),
    });
  },

  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post(Endpoints.AUTH.RESET_PASSWORD, {
      email: email.trim().toLowerCase(),
      otp: otp.trim(),
      newPassword,
    });
  },

  async updateProfile(payload: {
    firstName?: string;
    surname?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<User> {
    const res = await apiClient.put<User>(Endpoints.AUTH.UPDATE_PROFILE, payload);
    if (res) {
      await storage.setUser(res);
    }
    return res;
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = await storage.getRefreshToken();
      await apiClient.post(Endpoints.AUTH.LOGOUT, { refresh_token: refreshToken });
    } catch {
      // Ignore network errors on logout
    } finally {
      await storage.clearAuth();
    }
  },

  async checkHealth(): Promise<{ status: string; service: string }> {
    return apiClient.get(Endpoints.HEALTH);
  },
};

export default authService;
