# JS Analysis Client

[![npm version](https://img.shields.io/npm/v/ts-analysis-client.svg)](https://www.npmjs.com/package/ts-analysis-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

JavaScript/TypeScript SDK for [Go Analysis Server](../go-analysis-server) - 轻量级、易用的前端数据分析 SDK。

## ✨ 特性

- 🚀 **零依赖** - 轻量级实现，无需外部依赖
- 📦 **开箱即用** - 简单配置即可开始使用
- 🔄 **自动批量上报** - 智能队列管理，自动批量发送事件
- 💾 **持久化设备ID** - 自动生成和保存设备标识
- 🔐 **License 管理** - 内置 License 验证功能
- 📊 **丰富的 API** - 支持事件追踪、统计查询等完整功能
- 🌐 **多环境支持** - 浏览器、Node.js 全支持
- 📝 **TypeScript** - 完整的类型定义
- 🎯 **单例模式** - 全局访问，无需传递实例

## 📦 安装

```bash
npm install ts-analysis-client
```

或使用 CDN:

```html
<script src="https://unpkg.com/ts-analysis-client/dist/index.umd.js"></script>
```

## 🚀 快速开始

### 浏览器环境

#### 方式一：单例模式（推荐）

```javascript
import Analytics from 'ts-analysis-client';

// 1. 初始化（应用启动时调用一次）
Analytics.initialize({
  serverUrl: 'http://localhost:8080',
  productName: 'MyApp',
  debug: true,
});

// 2. 在任何地方使用 - 无需传递实例！
Analytics.track('button_click', {
  button_name: 'login',
  screen: 'home',
});

Analytics.trackPageView('/home', 'Home Page');

Analytics.trackAction('user', 'signup', 'email', 1.0);
```

#### 方式二：直接使用客户端

```javascript
import { AnalyticsClient } from 'ts-analysis-client';

// 创建客户端实例
const client = new AnalyticsClient({
  serverUrl: 'http://localhost:8080',
  productName: 'MyApp',
  debug: true,
});

// 使用客户端
await client.trackEvent('app_start', {
  version: '1.0.0',
});
```

### Node.js 环境

```javascript
const { AnalyticsClient } = require('ts-analysis-client');

const client = new AnalyticsClient({
  serverUrl: 'http://localhost:8080',
  productName: 'NodeApp',
});

// 追踪事件
await client.trackEvent('server_start', {
  node_version: process.version,
  platform: process.platform,
});

// 记得在应用退出时销毁客户端
process.on('SIGINT', () => {
  client.destroy();
  process.exit();
});
```

## 📖 API 文档

### 初始化配置

```typescript
interface AnalyticsConfig {
  serverUrl: string;        // 服务器地址（必填）
  productName: string;      // 产品名称（必填）
  deviceId?: string;        // 自定义设备ID（可选，默认自动生成）
  debug?: boolean;          // 调试模式（可选，默认 false）
  autoTrack?: boolean;      // 自动追踪（可选，默认 true）
  batchSize?: number;       // 批量大小（可选，默认 10）
  flushInterval?: number;   // 刷新间隔ms（可选，默认 5000）
  timeout?: number;         // 请求超时ms（可选，默认 10000）
  onError?: (error: Error) => void;  // 错误回调
}
```

### 事件追踪

#### 1. 追踪简单事件

```javascript
// 单例模式
await Analytics.track('event_name', {
  property1: 'value1',
  property2: 123,
});

// 直接使用客户端
await client.trackEvent('event_name', {
  property1: 'value1',
});
```

#### 2. 追踪用户行为

```javascript
// category, action, label, value, properties
await Analytics.trackAction(
  'user',           // 类别
  'click',          // 动作
  'buy_button',     // 标签
  99.99,            // 值
  { product_id: '123' }  // 额外属性
);
```

#### 3. 追踪页面浏览

```javascript
await Analytics.trackPageView(
  '/product/123',           // 页面路径
  'Product Detail Page',    // 页面标题
  { category: 'electronics' }  // 额外属性
);
```

#### 4. 上报安装事件

```javascript
const response = await Analytics.reportInstall({
  app_version: '1.0.0',
  // SDK 会自动收集设备信息
});
```

### License 管理

#### 验证 License

```javascript
const status = await Analytics.verifyLicense();

if (status && status.is_valid) {
  console.log('License 有效');
  console.log('类型:', status.license_type);
  console.log('启动次数:', status.launch_count);
} else {
  console.log('License 无效或已过期');
}
```

#### 获取 License 信息

```javascript
const client = Analytics.getInstance();
const status = await client.getLicense();
```

### 查询和统计

#### 查询事件

```javascript
const client = Analytics.getInstance();
const response = await client.queryEvents({
  event_name: 'button_click',
  start_time: 1704067200,
  end_time: 1704153600,
  page: 1,
  page_size: 20,
});

console.log('事件列表:', response.data.events);
console.log('总数:', response.data.total);
```

#### 获取统计信息

```javascript
const statsResponse = await client.getStats();
console.log('统计数据:', statsResponse.data);
```

#### 获取事件统计

```javascript
const eventStats = await client.getEventStats(
  1704067200,  // 开始时间
  1704153600   // 结束时间
);
```

#### 获取事件类型列表

```javascript
const eventTypes = await client.getEventTypes();
console.log('事件类型:', eventTypes.data);
```

### 队列管理

#### 手动刷新事件队列

```javascript
// 立即发送所有待发送的事件
await Analytics.flush();
```

#### 获取队列信息

```javascript
const client = Analytics.getInstance();
console.log('设备ID:', client.getDeviceId());
console.log('产品名称:', client.getProductName());
console.log('队列大小:', client.getQueueSize());
```

## 🎯 使用场景

### React 应用

```jsx
import React, { useEffect } from 'react';
import Analytics from 'ts-analysis-client';

// 在 App 根组件初始化
function App() {
  useEffect(() => {
    Analytics.initialize({
      serverUrl: process.env.REACT_APP_ANALYTICS_URL,
      productName: 'MyReactApp',
      debug: process.env.NODE_ENV === 'development',
    });
    
    // 上报安装
    Analytics.reportInstall({
      app_version: process.env.REACT_APP_VERSION,
    });
  }, []);
  
  return <div>...</div>;
}

// 在任何组件中使用
function ProductPage({ productId }) {
  useEffect(() => {
    Analytics.trackPageView(
      `/product/${productId}`,
      'Product Page',
      { product_id: productId }
    );
  }, [productId]);
  
  const handleBuyClick = () => {
    Analytics.trackAction('product', 'buy', productId, 99.99);
    // 购买逻辑...
  };
  
  return <button onClick={handleBuyClick}>Buy Now</button>;
}
```

### Vue 应用

```javascript
// main.js
import { createApp } from 'vue';
import Analytics from 'ts-analysis-client';
import App from './App.vue';

// 初始化
Analytics.initialize({
  serverUrl: import.meta.env.VITE_ANALYTICS_URL,
  productName: 'MyVueApp',
  debug: import.meta.env.DEV,
});

const app = createApp(App);

// 全局混入（可选）
app.mixin({
  mounted() {
    if (this.$route) {
      Analytics.trackPageView(
        this.$route.path,
        this.$route.meta.title || this.$route.name
      );
    }
  },
});

app.mount('#app');
```

```vue
<!-- 组件中使用 -->
<template>
  <button @click="handleClick">Click Me</button>
</template>

<script>
import Analytics from 'ts-analysis-client';

export default {
  methods: {
    handleClick() {
      Analytics.track('button_click', {
        button: 'test',
        page: this.$route.path,
      });
    }
  }
}
</script>
```

### Next.js 应用

```typescript
// app/layout.tsx
'use client';

import { useEffect } from 'react';
import Analytics from 'ts-analysis-client';

export default function RootLayout({ children }) {
  useEffect(() => {
    Analytics.initialize({
      serverUrl: process.env.NEXT_PUBLIC_ANALYTICS_URL!,
      productName: 'MyNextApp',
      debug: process.env.NODE_ENV === 'development',
    });
  }, []);
  
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}

// app/page.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Analytics from 'ts-analysis-client';

export default function Page() {
  const pathname = usePathname();
  
  useEffect(() => {
    Analytics.trackPageView(pathname);
  }, [pathname]);
  
  return <div>...</div>;
}
```

### Express 服务器

```javascript
const express = require('express');
const { AnalyticsClient } = require('ts-analysis-client');

const app = express();
const analytics = new AnalyticsClient({
  serverUrl: 'http://localhost:8080',
  productName: 'ExpressAPI',
});

// 中间件：追踪 API 请求
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    analytics.trackEvent('api_request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      user_agent: req.get('user-agent'),
    });
  });
  
  next();
});

// API 路由
app.post('/api/purchase', async (req, res) => {
  // 业务逻辑...
  
  await analytics.trackAction(
    'commerce',
    'purchase',
    req.body.product_id,
    req.body.amount
  );
  
  res.json({ success: true });
});

// 优雅关闭
process.on('SIGTERM', () => {
  analytics.destroy();
  server.close();
});

app.listen(3000);
```

## 🔧 高级用法

### 自动追踪页面浏览（SPA）

```javascript
// 在路由变化时自动追踪
function setupAutoTracking() {
  // History API
  const originalPushState = history.pushState;
  history.pushState = function() {
    originalPushState.apply(this, arguments);
    Analytics.trackPageView(location.pathname);
  };
  
  // Hash change
  window.addEventListener('hashchange', () => {
    Analytics.trackPageView(location.hash);
  });
}
```

### 错误追踪

```javascript
Analytics.initialize({
  serverUrl: 'http://localhost:8080',
  productName: 'MyApp',
  onError: (error) => {
    console.error('Analytics Error:', error);
    // 发送到错误监控服务...
  },
});

// 全局错误处理
window.addEventListener('error', (event) => {
  Analytics.track('js_error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});
```

### 性能监控

```javascript
// 追踪页面加载性能
window.addEventListener('load', () => {
  const perfData = performance.timing;
  const loadTime = perfData.loadEventEnd - perfData.navigationStart;
  
  Analytics.track('page_load_time', {
    load_time: loadTime,
    dns_time: perfData.domainLookupEnd - perfData.domainLookupStart,
    tcp_time: perfData.connectEnd - perfData.connectStart,
    dom_ready_time: perfData.domContentLoadedEventEnd - perfData.navigationStart,
  });
});
```

## 🛠️ 开发

### 安装依赖

```bash
npm install
```

### 构建

```bash
npm run build
```

### 开发模式

```bash
npm run dev
```

### 运行示例

```bash
# 浏览器示例
# 先构建，然后用浏览器打开 examples/basic.html

# Node.js 示例
npm run build
node examples/node-example.js
```

## 📝 API 兼容性

本 SDK 完全兼容 [Go Analysis Server](../go-analysis-server) 的所有 API 端点：

- ✅ `POST /api/events` - 单个事件
- ✅ `POST /api/events/batch` - 批量事件
- ✅ `GET /api/events/query` - 查询事件
- ✅ `GET /api/events/stats` - 事件统计
- ✅ `GET /api/events/types` - 事件类型
- ✅ `POST /api/installs/push` - 安装事件
- ✅ `POST /api/license/verify` - 验证 License
- ✅ `GET /api/license/get` - 获取 License
- ✅ `GET /api/stats` - 系统统计
- ✅ `GET /api/health` - 健康检查

## 🤝 相关项目

- [go-analysis-server](../go-analysis-server) - Go 后端服务器
- [flutter_analysis_client](../flutter_analysis_client) - Flutter SDK
- [go-analysis-frontend](../go-analysis-frontend) - Next.js 管理后台

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

## 🆘 支持

如有问题或建议：

1. 查看 [示例代码](./examples)
2. 提交 [Issue](../../issues)
3. 查看 [API 文档](../go-analysis-server/README.md)

---

**Happy Tracking! 🎉**
