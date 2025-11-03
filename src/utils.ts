import { DeviceInfo } from './types';

/**
 * 生成 UUID v4
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 获取或创建设备 ID
 */
export function getOrCreateDeviceId(): string {
  const storageKey = 'analytics_device_id';
  
  try {
    if (typeof localStorage !== 'undefined') {
      let deviceId = localStorage.getItem(storageKey);
      if (!deviceId) {
        deviceId = generateUUID();
        localStorage.setItem(storageKey, deviceId);
      }
      return deviceId;
    }
  } catch (e) {
    // localStorage 不可用
  }
  
  // Fallback: 使用 cookie
  try {
    if (typeof document !== 'undefined') {
      const name = storageKey + '=';
      const decodedCookie = decodeURIComponent(document.cookie);
      const ca = decodedCookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
          return c.substring(name.length, c.length);
        }
      }
      
      // Create new device ID
      const deviceId = generateUUID();
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 10); // 10 years
      document.cookie = `${storageKey}=${deviceId};expires=${expires.toUTCString()};path=/`;
      return deviceId;
    }
  } catch (e) {
    // Cookie 不可用
  }
  
  // 最后的 fallback
  return generateUUID();
}

/**
 * 收集设备信息
 */
export function collectDeviceInfo(): Partial<DeviceInfo> {
  const info: Partial<DeviceInfo> = {};
  
  if (typeof navigator !== 'undefined') {
    info.user_agent = navigator.userAgent || '';
    info.language = navigator.language || '';
    
    // 解析 User Agent 获取操作系统信息
    const ua = navigator.userAgent;
    if (/Windows/i.test(ua)) {
      info.os_name = 'Windows';
      const match = ua.match(/Windows NT ([\d.]+)/);
      if (match) info.os_version = match[1];
    } else if (/Mac OS X/i.test(ua)) {
      info.os_name = 'macOS';
      const match = ua.match(/Mac OS X ([\d_]+)/);
      if (match) info.os_version = match[1].replace(/_/g, '.');
    } else if (/Android/i.test(ua)) {
      info.os_name = 'Android';
      const match = ua.match(/Android ([\d.]+)/);
      if (match) info.os_version = match[1];
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      info.os_name = /iPad/.test(ua) ? 'iPad' : 'iPhone';
      const match = ua.match(/OS ([\d_]+)/);
      if (match) info.os_version = match[1].replace(/_/g, '.');
    } else if (/Linux/i.test(ua)) {
      info.os_name = 'Linux';
    }
    
    // 设备型号和品牌（移动设备）
    if (/iPhone/.test(ua)) {
      info.device_brand = 'Apple';
      info.device_model = 'iPhone';
    } else if (/iPad/.test(ua)) {
      info.device_brand = 'Apple';
      info.device_model = 'iPad';
    } else if (/Android/.test(ua)) {
      const brandMatch = ua.match(/Android.*;\s*([^;)]+)\s+Build/);
      if (brandMatch) {
        info.device_model = brandMatch[1].trim();
      }
    }
  }
  
  if (typeof screen !== 'undefined') {
    info.screen_width = screen.width;
    info.screen_height = screen.height;
  }
  
  if (typeof Intl !== 'undefined') {
    try {
      info.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
      // Ignore
    }
  }
  
  return info;
}

/**
 * 获取当前 Unix 时间戳（秒）
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];
      
      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue as any;
      }
    }
  }
  
  return result;
}

/**
 * 简单的日志工具
 */
export class Logger {
  constructor(private debug: boolean = false) {}
  
  log(...args: any[]): void {
    if (this.debug && typeof console !== 'undefined') {
      console.log('[Analytics]', ...args);
    }
  }
  
  warn(...args: any[]): void {
    if (this.debug && typeof console !== 'undefined') {
      console.warn('[Analytics]', ...args);
    }
  }
  
  error(...args: any[]): void {
    if (typeof console !== 'undefined') {
      console.error('[Analytics]', ...args);
    }
  }
}
