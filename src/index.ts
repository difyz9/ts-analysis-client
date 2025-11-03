/**
 * JS Analysis Client
 * JavaScript SDK for Go Analysis Server
 * 
 * @version 1.0.0
 * @author Your Name
 * @license MIT
 */

// 导出主类
export { AnalyticsClient } from './analytics-client';
export { HttpClient } from './http-client';

// 导出单例
export { default as Analytics } from './analytics';
export { default } from './analytics';

// 导出类型
export type {
  AnalyticsConfig,
  Event,
  EventProperties,
  InstallEvent,
  VerifyLicenseRequest,
  LicenseStatus,
  QueryParams,
  ApiResponse,
  DeviceInfo,
  BatchEventsRequest,
} from './types';

// 导出工具函数
export {
  generateUUID,
  getOrCreateDeviceId,
  collectDeviceInfo,
  getCurrentTimestamp,
} from './utils';
