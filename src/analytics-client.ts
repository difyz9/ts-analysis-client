import {
  AnalyticsConfig,
  Event,
  EventProperties,
  InstallEvent,
  VerifyLicenseRequest,
  LicenseStatus,
  QueryParams,
  ApiResponse,
} from './types';
import { HttpClient } from './http-client';
import {
  getOrCreateDeviceId,
  collectDeviceInfo,
  getCurrentTimestamp,
  deepMerge,
  Logger,
} from './utils';

/**
 * Analytics 客户端主类
 */
export class AnalyticsClient {
  private config: AnalyticsConfig & {
    debug: boolean;
    autoTrack: boolean;
    batchSize: number;
    flushInterval: number;
    timeout: number;
    enableEncryption: boolean;
    encryptionKey: string;
    onError: (error: Error) => void;
  };
  private httpClient: HttpClient;
  private logger: Logger;
  private deviceId: string;
  private eventQueue: Event[] = [];
  private flushTimer?: number;
  private isFlushing: boolean = false;

  constructor(config: AnalyticsConfig) {
    // 合并默认配置
    const defaultConfig = {
      serverUrl: '',
      productName: '',
      deviceId: '',
      debug: false,
      autoTrack: true,
      batchSize: 10,
      flushInterval: 5000,
      timeout: 10000,
      enableEncryption: false,
      encryptionKey: '',
      onError: () => {},
    };
    
    this.config = { ...defaultConfig, ...config };

    // 初始化日志
    this.logger = new Logger(this.config.debug);

    // 获取或创建设备 ID
    this.deviceId = this.config.deviceId || getOrCreateDeviceId();
    this.logger.log('Device ID:', this.deviceId);

    // 初始化 HTTP 客户端
    this.httpClient = new HttpClient({
      baseURL: this.config.serverUrl,
      timeout: this.config.timeout,
      debug: this.config.debug,
      onError: this.config.onError,
    });

    // 启动自动刷新定时器
    if (this.config.flushInterval > 0) {
      this.startFlushTimer();
    }

    // 页面卸载时刷新事件
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush(true);
      });
    }

    this.logger.log('AnalyticsClient initialized', this.config);
  }

  /**
   * 追踪事件
   */
  async track(event: Omit<Event, 'product' | 'device_id'>): Promise<boolean> {
    const fullEvent: Event = {
      ...event,
      product: this.config.productName,
      device_id: this.deviceId,
      timestamp: event.timestamp || getCurrentTimestamp(),
    };

    this.logger.log('Tracking event:', fullEvent);

    // 添加到队列
    this.eventQueue.push(fullEvent);

    // 检查是否需要立即刷新
    if (this.eventQueue.length >= this.config.batchSize) {
      return this.flush();
    }

    return true;
  }

  /**
   * 追踪简单事件
   */
  async trackEvent(
    name: string,
    properties?: EventProperties
  ): Promise<boolean> {
    return this.track({
      name,
      properties,
    });
  }

  /**
   * 追踪用户行为（类似 Google Analytics）
   */
  async trackAction(
    category: string,
    action: string,
    label?: string,
    value?: number,
    properties?: EventProperties
  ): Promise<boolean> {
    return this.track({
      name: `${category}_${action}`,
      category,
      action,
      label,
      value,
      properties,
    });
  }

  /**
   * 追踪页面浏览
   */
  async trackPageView(
    pagePath: string,
    pageTitle?: string,
    properties?: EventProperties
  ): Promise<boolean> {
    return this.track({
      name: 'page_view',
      category: 'page',
      action: 'view',
      label: pagePath,
      properties: {
        page_path: pagePath,
        page_title: pageTitle || pagePath,
        ...properties,
      },
    });
  }

  /**
   * 上报安装事件
   */
  async reportInstall(additionalData?: Partial<InstallEvent>): Promise<ApiResponse> {
    const deviceInfo = collectDeviceInfo();
    const installEvent: InstallEvent = {
      product: this.config.productName,
      device_id: this.deviceId,
      timestamp: getCurrentTimestamp(),
      ...deviceInfo,
      ...additionalData,
    };

    this.logger.log('Reporting install event:', installEvent);

    const response = await this.httpClient.post<any>(
      '/api/installs/push',
      installEvent
    );

    if (response.code === 200) {
      this.logger.log('Install event reported successfully');
    } else {
      this.logger.error('Failed to report install event:', response.message);
    }

    return response;
  }

  /**
   * 验证 License
   */
  async verifyLicense(): Promise<LicenseStatus | null> {
    const request: VerifyLicenseRequest = {
      product: this.config.productName,
      device_id: this.deviceId,
    };

    this.logger.log('Verifying license:', request);

    const response = await this.httpClient.post<LicenseStatus>(
      '/api/license/verify',
      request
    );

    if (response.code === 200 && response.data) {
      this.logger.log('License verified:', response.data);
      return response.data;
    } else {
      this.logger.error('License verification failed:', response.message);
      return null;
    }
  }

  /**
   * 获取 License 信息
   */
  async getLicense(): Promise<LicenseStatus | null> {
    const params = {
      product: this.config.productName,
      device_id: this.deviceId,
    };

    this.logger.log('Getting license info:', params);

    const response = await this.httpClient.get<LicenseStatus>(
      '/api/license/get',
      params
    );

    if (response.code === 200 && response.data) {
      return response.data;
    } else {
      this.logger.error('Failed to get license:', response.message);
      return null;
    }
  }

  /**
   * 查询事件
   */
  async queryEvents(params: QueryParams): Promise<ApiResponse<any>> {
    const queryParams = {
      product: this.config.productName,
      device_id: this.deviceId,
      ...params,
    };

    this.logger.log('Querying events:', queryParams);

    return this.httpClient.get('/api/events/query', queryParams);
  }

  /**
   * 获取统计信息
   */
  async getStats(): Promise<ApiResponse<any>> {
    this.logger.log('Getting stats');
    return this.httpClient.get('/api/stats');
  }

  /**
   * 获取事件统计
   */
  async getEventStats(
    startTime?: number,
    endTime?: number
  ): Promise<ApiResponse<any>> {
    const params: any = {
      product: this.config.productName,
    };

    if (startTime) params.start_time = startTime;
    if (endTime) params.end_time = endTime;

    this.logger.log('Getting event stats:', params);

    return this.httpClient.get('/api/events/stats', params);
  }

  /**
   * 获取事件类型列表
   */
  async getEventTypes(): Promise<ApiResponse<any>> {
    const params = {
      product: this.config.productName,
    };

    this.logger.log('Getting event types:', params);

    return this.httpClient.get('/api/events/types', params);
  }

  /**
   * 刷新事件队列
   */
  async flush(sync: boolean = false): Promise<boolean> {
    if (this.isFlushing || this.eventQueue.length === 0) {
      return true;
    }

    this.isFlushing = true;
    const events = [...this.eventQueue];
    this.eventQueue = [];

    this.logger.log(`Flushing ${events.length} events...`);

    try {
      const response = await this.httpClient.post('/api/events/batch', {
        events,
      });

      if (response.code === 200) {
        this.logger.log('Events flushed successfully');
        return true;
      } else {
        this.logger.error('Failed to flush events:', response.message);
        // 失败时重新加入队列
        this.eventQueue.unshift(...events);
        return false;
      }
    } catch (error: any) {
      this.logger.error('Error flushing events:', error);
      // 失败时重新加入队列
      this.eventQueue.unshift(...events);
      return false;
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * 启动自动刷新定时器
   */
  private startFlushTimer(): void {
    if (typeof setInterval !== 'undefined') {
      this.flushTimer = setInterval(() => {
        this.flush();
      }, this.config.flushInterval) as any;
    }
  }

  /**
   * 停止自动刷新定时器
   */
  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  /**
   * 获取设备 ID
   */
  getDeviceId(): string {
    return this.deviceId;
  }

  /**
   * 获取产品名称
   */
  getProductName(): string {
    return this.config.productName;
  }

  /**
   * 获取队列中的事件数量
   */
  getQueueSize(): number {
    return this.eventQueue.length;
  }

  /**
   * 销毁客户端
   */
  destroy(): void {
    this.logger.log('Destroying AnalyticsClient');
    this.stopFlushTimer();
    this.flush(true);
  }
}
