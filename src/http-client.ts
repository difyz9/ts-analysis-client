import { ApiResponse } from './types';
import { Logger } from './utils';

/**
 * HTTP 客户端配置
 */
export interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  debug?: boolean;
  onError?: (error: Error) => void;
}

/**
 * HTTP 客户端
 */
export class HttpClient {
  private baseURL: string;
  private timeout: number;
  private headers: Record<string, string>;
  private logger: Logger;
  private onError?: (error: Error) => void;

  constructor(config: HttpClientConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, ''); // 移除尾部斜杠
    this.timeout = config.timeout || 10000;
    this.headers = config.headers || {};
    this.logger = new Logger(config.debug);
    this.onError = config.onError;
  }

  /**
   * 发送 GET 请求
   */
  async get<T = any>(path: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = this.buildURL(path, params);
    return this.request<T>('GET', url);
  }

  /**
   * 发送 POST 请求
   */
  async post<T = any>(path: string, data?: any): Promise<ApiResponse<T>> {
    const url = this.buildURL(path);
    return this.request<T>('POST', url, data);
  }

  /**
   * 发送 PUT 请求
   */
  async put<T = any>(path: string, data?: any): Promise<ApiResponse<T>> {
    const url = this.buildURL(path);
    return this.request<T>('PUT', url, data);
  }

  /**
   * 发送 DELETE 请求
   */
  async delete<T = any>(path: string): Promise<ApiResponse<T>> {
    const url = this.buildURL(path);
    return this.request<T>('DELETE', url);
  }

  /**
   * 核心请求方法
   */
  private async request<T>(
    method: string,
    url: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      this.logger.log(`${method} ${url}`, data || '');

      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...this.headers,
        },
        signal: controller.signal,
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      clearTimeout(timeoutId);

      // 解析响应
      let result: ApiResponse<T>;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        // 非 JSON 响应，包装为标准格式
        const text = await response.text();
        result = {
          code: response.status,
          message: response.statusText,
          data: text as any,
        };
      }

      // 检查 HTTP 状态码
      if (!response.ok) {
        const error = new Error(result.message || `HTTP Error: ${response.status}`);
        this.logger.error('Request failed:', error);
        if (this.onError) {
          this.onError(error);
        }
        return result;
      }

      this.logger.log('Response:', result);
      return result;
    } catch (error: any) {
      clearTimeout(timeoutId);

      let errorMessage = 'Network request failed';
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout';
      } else if (error.message) {
        errorMessage = error.message;
      }

      this.logger.error('Request error:', errorMessage);
      
      const err = new Error(errorMessage);
      if (this.onError) {
        this.onError(err);
      }

      return {
        code: -1,
        message: errorMessage,
      };
    }
  }

  /**
   * 构建完整 URL
   */
  private buildURL(path: string, params?: Record<string, any>): string {
    let url = `${this.baseURL}${path}`;

    if (params) {
      const queryString = Object.keys(params)
        .filter((key) => params[key] !== undefined && params[key] !== null)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');

      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return url;
  }

  /**
   * 设置请求头
   */
  setHeader(key: string, value: string): void {
    this.headers[key] = value;
  }

  /**
   * 移除请求头
   */
  removeHeader(key: string): void {
    delete this.headers[key];
  }
}
