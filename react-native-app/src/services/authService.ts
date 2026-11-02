/**
 * Authentication & Merchant Session Service
 */
import apiClient from '../api/apiClient';
import Endpoints from '../api/endpoints';
import storage from '../utils/storage';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '../models/types';

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>(Endpoints.AUTH.LOGIN, {
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    });

    const token = res.token || res.access_token;
    if (token) {
      await storage.setAuthToken(token);
    }
    if (res.user) {
      await storage.setUser(res.user);
    }
    return res;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>(Endpoints.AUTH.REGISTER, {
      firstName: payload.firstName.trim(),
      surname: payload.surname.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      storeType: payload.storeType,
      password: payload.password,
    });

    const token = res.token || res.access_token;
    if (token) {
      await storage.setAuthToken(token);
    }
    if (res.user) {
      await storage.setUser(res.user);
    }
    return res;
  },

  async getMe(): Promise<User> {
    const user = await apiClient.get<User>(Endpoints.AUTH.ME);
    if (user) {
      await storage.setUser(user);
    }
    return user;
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post(Endpoints.AUTH.FORGOT_PASSWORD, {
      email: email.trim().toLowerCase(),
    });
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(Endpoints.AUTH.LOGOUT);
    } catch {
      // Ignore network errors on logout
    } finally {
      await storage.removeAuthToken();
      await storage.removeUser();
    }
  },

  async checkHealth(): Promise<{ status: string; service: string }> {
    return apiClient.get(Endpoints.HEALTH);
  },
};

export default authService;

