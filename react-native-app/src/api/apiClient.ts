/**
 * Centralized Axios API Client
 * Configured with dynamic Base URL, Bearer Auth interceptors,
 * 15-minute access token refresh with concurrent request queueing,
 * and 15-hour session lifecycle management.
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Config } from '../constants/config';
import { Endpoints } from './endpoints';
import storage from '../utils/storage';

interface FailedRequestQueueItem {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}

class ApiClient {
  private instance: AxiosInstance;
  private currentBaseUrl: string = Config.DEFAULT_API_URL;
  private onUnauthorizedCallback: (() => void) | null = null;
  private isRefreshing: boolean = false;
  private failedQueue: FailedRequestQueueItem[] = [];

  constructor() {
    this.instance = axios.create({
      baseURL: this.currentBaseUrl,
      timeout: Config.TIMEOUT_MS,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.setupInterceptors();
    this.initBaseUrl();
  }

  private async initBaseUrl() {
    try {
      const customUrl = await storage.getCustomApiUrl();
      if (customUrl) {
        this.setBaseUrl(customUrl);
      }
    } catch {
      // Use default
    }
  }

  public setBaseUrl(url: string) {
    this.currentBaseUrl = url.trim().replace(/\/+$/, '');
    this.instance.defaults.baseURL = this.currentBaseUrl;
  }

  public getBaseUrl(): string {
    return this.currentBaseUrl;
  }

  public setOnUnauthorized(callback: () => void) {
    this.onUnauthorizedCallback = callback;
  }

  private processQueue(error: any = null, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private setupInterceptors() {
    // Request Interceptor: Attach Bearer JWT
    this.instance.interceptors.request.use(
      async (config) => {
        const token = await storage.getAuthToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor: Format errors and handle 401 with coordinated refresh
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        if (!error.response) {
          const message = error.message?.includes('timeout')
            ? 'Connection timed out. Please check if your FastAPI backend is running.'
            : 'Unable to reach Nexora Mart server. Check network connection.';
          return Promise.reject(new Error(message));
        }

        const originalRequest = error.config;
        const { status, data } = error.response;

        // Check if error is 401 Unauthorized
        if (status === 401) {
          const isAuthPath =
            originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/register') ||
            originalRequest.url?.includes('/auth/refresh');

          // If already retried or it's an auth endpoint, fail directly
          if (originalRequest._retry || isAuthPath) {
            await storage.clearAuth();
            if (this.onUnauthorizedCallback) {
              this.onUnauthorizedCallback();
            }
            return Promise.reject(this.enhanceError(error));
          }

          // Check if session has exceeded 15 hours
          const sessionExpiresAt = await storage.getSessionExpiresAt();
          if (sessionExpiresAt && Date.now() > sessionExpiresAt) {
            await storage.clearAuth();
            if (this.onUnauthorizedCallback) {
              this.onUnauthorizedCallback();
            }
            return Promise.reject(new Error('Session expired (15-hour limit). Please log in again.'));
          }

          const refreshToken = await storage.getRefreshToken();
          if (!refreshToken) {
            await storage.clearAuth();
            if (this.onUnauthorizedCallback) {
              this.onUnauthorizedCallback();
            }
            return Promise.reject(this.enhanceError(error));
          }

          if (this.isRefreshing) {
            // Queue concurrent requests
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((newToken) => {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return this.instance(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Perform single coordinated refresh call
            const refreshResponse = await axios.post(
              `${this.currentBaseUrl}${Endpoints.AUTH.REFRESH}`,
              { refresh_token: refreshToken },
              { headers: { 'Content-Type': 'application/json' } }
            );

            const newAccessToken =
              refreshResponse.data?.access_token ||
              refreshResponse.data?.token;
            const newRefreshToken = refreshResponse.data?.refresh_token;

            if (newAccessToken) {
              await storage.setAuthToken(newAccessToken);
              if (newRefreshToken) {
                await storage.setRefreshToken(newRefreshToken);
              }
              if (refreshResponse.data?.user) {
                await storage.setUser(refreshResponse.data.user);
              }
              if (refreshResponse.data?.store) {
                await storage.setStore(refreshResponse.data.store);
              }

              this.instance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

              this.processQueue(null, newAccessToken);
              return this.instance(originalRequest);
            } else {
              throw new Error('Refresh endpoint returned invalid token structure');
            }
          } catch (refreshErr) {
            this.processQueue(refreshErr, null);
            await storage.clearAuth();
            if (this.onUnauthorizedCallback) {
              this.onUnauthorizedCallback();
            }
            return Promise.reject(refreshErr);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.enhanceError(error));
      }
    );
  }

  private enhanceError(error: any): Error {
    const { status, data } = error.response || {};
    let errorMessage = 'An unexpected error occurred.';
    if (data) {
      if (typeof data.detail === 'string') {
        errorMessage = data.detail;
      } else if (Array.isArray(data.detail)) {
        errorMessage = data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
      } else if (data.message) {
        errorMessage = data.message;
      }
    }

    const enhancedError = new Error(errorMessage);
    (enhancedError as any).status = status;
    (enhancedError as any).data = data;
    return enhancedError;
  }

  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.instance.get<T>(url, config);
    return res.data;
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.instance.post<T>(url, data, config);
    return res.data;
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.instance.put<T>(url, data, config);
    return res.data;
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.instance.patch<T>(url, data, config);
    return res.data;
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.instance.delete<T>(url, config);
    return res.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
