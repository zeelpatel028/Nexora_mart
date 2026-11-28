/**
 * Centralized Axios API Client
 * Uses dynamic Base URL and extracted request/response interceptors.
 */
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Config } from './config';
import storage from './storage';
import { attachApiInterceptors } from './interceptors';

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

    attachApiInterceptors(this.instance, {
      getBaseUrl: () => this.currentBaseUrl,
      getOnUnauthorized: () => this.onUnauthorizedCallback,
    });
    this.initBaseUrl();
  }

  private async initBaseUrl() {
    try {
      const customUrl = await storage.getCustomApiUrl();
      if (customUrl) {
        this.setBaseUrl(customUrl);
      }
    } catch {
      // Use default base URL
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
