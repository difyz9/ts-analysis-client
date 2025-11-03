import { AnalyticsClient } from './analytics-client';
import { AnalyticsConfig, EventProperties, InstallEvent } from './types';

/**
 * 全局单例 Analytics 实例
 */
class Analytics {
  private static instance: AnalyticsClient | null = null;
  private static initialized: boolean = false;

  /**
   * 初始化 Analytics（必须在使用前调用）
   */
  static initialize(config: AnalyticsConfig): AnalyticsClient {
    if (this.initialized && this.instance) {
      console.warn('[Analytics] Already initialized. Destroying previous instance.');
      this.instance.destroy();
    }

    this.instance = new AnalyticsClient(config);
    this.initialized = true;
    return this.instance;
  }

  /**
   * 获取 Analytics 实例
   */
  static getInstance(): AnalyticsClient {
    if (!this.instance) {
      throw new Error('[Analytics] Not initialized. Call Analytics.initialize() first.');
    }
    return this.instance;
  }

  /**
   * 检查是否已初始化
   */
  static isInitialized(): boolean {
    return this.initialized && this.instance !== null;
  }

  /**
   * 便捷方法：追踪事件
   */
  static async track(
    name: string,
    properties?: EventProperties
  ): Promise<boolean> {
    return this.getInstance().trackEvent(name, properties);
  }

  /**
   * 便捷方法：追踪用户行为
   */
  static async trackAction(
    category: string,
    action: string,
    label?: string,
    value?: number,
    properties?: EventProperties
  ): Promise<boolean> {
    return this.getInstance().trackAction(category, action, label, value, properties);
  }

  /**
   * 便捷方法：追踪页面浏览
   */
  static async trackPageView(
    pagePath: string,
    pageTitle?: string,
    properties?: EventProperties
  ): Promise<boolean> {
    return this.getInstance().trackPageView(pagePath, pageTitle, properties);
  }

  /**
   * 便捷方法：上报安装
   */
  static async reportInstall(additionalData?: Partial<InstallEvent>) {
    return this.getInstance().reportInstall(additionalData);
  }

  /**
   * 便捷方法：验证 License
   */
  static async verifyLicense() {
    return this.getInstance().verifyLicense();
  }

  /**
   * 便捷方法：刷新事件队列
   */
  static async flush() {
    return this.getInstance().flush();
  }

  /**
   * 销毁实例
   */
  static destroy(): void {
    if (this.instance) {
      this.instance.destroy();
      this.instance = null;
      this.initialized = false;
    }
  }
}

export default Analytics;
