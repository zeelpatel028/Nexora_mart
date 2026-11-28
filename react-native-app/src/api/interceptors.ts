/**
 * Centralized Axios Request & Response Interceptors
 * Handles Bearer JWT attachment, cold-start network retries, and 401 token refresh queueing.
 */
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Endpoints } from './endpoints';
import storage from './storage';

interface FailedRequestQueueItem {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}

export interface InterceptorCallbacks {
  getBaseUrl: () => string;
  getOnUnauthorized: () => (() => void) | null;
}

export function enhanceApiError(error: any): Error {
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

export function attachApiInterceptors(
  instance: AxiosInstance,
  callbacks: InterceptorCallbacks
): void {
  let isRefreshing = false;
  let failedQueue: FailedRequestQueueItem[] = [];

  const processQueue = (error: any = null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  instance.interceptors.request.use(
    async (config) => {
      const token = await storage.getAuthToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      if (!error.response) {
        const config = error.config;
        if (config && !config._networkRetry) {
          config._networkRetry = true;
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return instance(config);
        }

        const message =
          error.message?.includes('timeout') || error.code === 'ECONNABORTED'
            ? 'Connection timed out. Tulsi Mart server is starting up, please try again.'
            : 'Unable to reach Tulsi Mart server. Check network connection.';
        return Promise.reject(new Error(message));
      }

      const originalRequest = error.config;
      const { status } = error.response;
      const onUnauthorized = callbacks.getOnUnauthorized();

      if (status === 401) {
        const isAuthPath =
          originalRequest.url?.includes('/auth/login') ||
          originalRequest.url?.includes('/auth/register') ||
          originalRequest.url?.includes('/auth/refresh');

        if (originalRequest._retry || isAuthPath) {
          await storage.clearAuth();
          if (onUnauthorized) onUnauthorized();
          return Promise.reject(enhanceApiError(error));
        }

        const sessionExpiresAt = await storage.getSessionExpiresAt();
        if (sessionExpiresAt && Date.now() > sessionExpiresAt) {
          await storage.clearAuth();
          if (onUnauthorized) onUnauthorized();
          return Promise.reject(new Error('Session expired (15-hour limit). Please log in again.'));
        }

        const refreshToken = await storage.getRefreshToken();
        if (!refreshToken) {
          await storage.clearAuth();
          if (onUnauthorized) onUnauthorized();
          return Promise.reject(enhanceApiError(error));
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((newToken) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return instance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshResponse = await axios.post(
            `${callbacks.getBaseUrl()}${Endpoints.AUTH.REFRESH}`,
            { refresh_token: refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const newAccessToken =
            refreshResponse.data?.access_token || refreshResponse.data?.token;
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

            instance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            processQueue(null, newAccessToken);
            return instance(originalRequest);
          }

          throw new Error('Refresh endpoint returned invalid token structure');
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          await storage.clearAuth();
          if (onUnauthorized) onUnauthorized();
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(enhanceApiError(error));
    }
  );
}
