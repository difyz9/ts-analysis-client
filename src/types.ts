/**
 * 事件属性类型
 */
export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * 事件数据结构
 */
export interface Event {
  name: string;
  product: string;
  device_id: string;
  timestamp?: number;
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  properties?: EventProperties;
}

/**
 * 批量事件请求
 */
export interface BatchEventsRequest {
  events: Event[];
}

/**
 * 安装事件数据
 */
export interface InstallEvent {
  product: string;
  device_id: string;
  timestamp?: number;
  app_version?: string;
  os_name?: string;
  os_version?: string;
  device_model?: string;
  device_brand?: string;
  screen_width?: number;
  screen_height?: number;
  language?: string;
  timezone?: string;
  ip_address?: string;
  user_agent?: string;
}

/**
 * License 验证请求
 */
export interface VerifyLicenseRequest {
  product: string;
  device_id: string;
}

/**
 * License 状态响应
 */
export interface LicenseStatus {
  is_valid: boolean;
  license_type: string;
  launch_count: number;
  max_launch_count: number;
  is_expired: boolean;
  is_disabled: boolean;
  expire_at?: string;
  message?: string;
}

/**
 * 查询参数
 */
export interface QueryParams {
  product?: string;
  device_id?: string;
  event_name?: string;
  start_time?: number;
  end_time?: number;
  page?: number;
  page_size?: number;
}

/**
 * API 响应结构
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

/**
 * SDK 配置选项
 */
export interface AnalyticsConfig {
  serverUrl: string;
  productName: string;
  deviceId?: string;
  debug?: boolean;
  autoTrack?: boolean;
  batchSize?: number;
  flushInterval?: number;
  timeout?: number;
  enableEncryption?: boolean;
  encryptionKey?: string;
  onError?: (error: Error) => void;
}

/**
 * 设备信息
 */
export interface DeviceInfo {
  device_id: string;
  os_name: string;
  os_version: string;
  device_model: string;
  device_brand: string;
  screen_width: number;
  screen_height: number;
  language: string;
  timezone: string;
  user_agent: string;
}
