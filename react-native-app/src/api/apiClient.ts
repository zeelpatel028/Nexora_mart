/**
 * Centralized Axios API Client
 * Configured with dynamic Base URL, Bearer Auth interceptors,
 * and unified FastAPI error response normalization.
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Config } from '../constants/config';
import storage from '../utils/storage';

class ApiClient {
  private instance: AxiosInstance;
  private currentBaseUrl: string = Config.DEFAULT_API_URL;
  private onUnauthorizedCallback: (() => void) | null = null;

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

    // Response Interceptor: Format errors and handle 401
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        if (!error.response) {
          // Network disconnected or timeout
          const message = error.message?.includes('timeout')
            ? 'Connection timed out. Please check if your FastAPI backend is running.'
            : 'Unable to reach Nexora Mart server. Check network connection.';
          return Promise.reject(new Error(message));
        }

        const { status, data } = error.response;

        if (status === 401) {
          await storage.removeAuthToken();
          if (this.onUnauthorizedCallback) {
            this.onUnauthorizedCallback();
          }
        }

        // Extract FastAPI standard error detail
        let errorMessage = 'An unexpected error occurred.';
        if (data) {
          if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          } else if (Array.isArray(data.detail)) {
            // Pydantic validation error array
            errorMessage = data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
          } else if (data.message) {
            errorMessage = data.message;
          }
        }

        const enhancedError = new Error(errorMessage);
        (enhancedError as any).status = status;
        (enhancedError as any).data = data;

        return Promise.reject(enhancedError);
      }
    );
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

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.instance.delete<T>(url, config);
    return res.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;

