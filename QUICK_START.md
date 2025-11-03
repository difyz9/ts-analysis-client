# 🚀 快速开始指南

## 安装步骤

### 1. 安装依赖

```bash
cd js_analysis_client
npm install
```

### 2. 构建 SDK

```bash
npm run build
```

构建完成后，会在 `dist/` 目录生成以下文件：
- `index.js` - CommonJS 格式（Node.js）
- `index.esm.js` - ES Module 格式（现代打包工具）
- `index.umd.js` - UMD 格式（浏览器直接使用）
- `index.d.ts` - TypeScript 类型定义

## 使用方式

### 方式一：浏览器直接使用（最简单）

1. 确保 Go Analysis Server 正在运行：
```bash
cd ../go-analysis-server
go run main.go
```

2. 用浏览器打开示例文件：
```
open examples/basic.html
```

3. 点击按钮测试各种功能！

### 方式二：在 React/Vue/Next.js 项目中使用

#### 安装（本地开发）

```bash
# 在你的项目目录中
npm install /path/to/js_analysis_client
```

#### 或者链接本地包（推荐开发时使用）

```bash
# 在 js_analysis_client 目录
npm link

# 在你的项目目录
npm link js-analysis-client
```

#### 使用示例

```javascript
// 在你的应用入口文件（如 main.js, App.jsx, _app.tsx）
import Analytics from 'js-analysis-client';

Analytics.initialize({
  serverUrl: 'http://localhost:8080',
  productName: 'MyApp',
  debug: true,
});

// 在任何组件中使用
Analytics.track('button_click', { button: 'test' });
Analytics.trackPageView('/home');
Analytics.trackAction('user', 'login', 'email');
```

### 方式三：Node.js 服务器使用

```bash
# 确保已经构建
npm run build

# 运行 Node.js 示例
node examples/node-example.js
```

## 常见问题

### Q: 为什么事件没有立即发送？

A: SDK 默认使用批量发送机制，事件会被缓存直到：
- 达到批量大小（默认 10 个事件）
- 达到刷新间隔（默认 5 秒）
- 手动调用 `flush()`
- 页面卸载时

可以通过配置调整：
```javascript
Analytics.initialize({
  serverUrl: 'http://localhost:8080',
  productName: 'MyApp',
  batchSize: 3,        // 3 个事件就发送
  flushInterval: 1000, // 1 秒自动刷新
});
```

### Q: 如何在开发时查看详细日志？

A: 开启 debug 模式：
```javascript
Analytics.initialize({
  serverUrl: 'http://localhost:8080',
  productName: 'MyApp',
  debug: true,  // 开启调试日志
});
```

### Q: 设备 ID 是如何生成的？

A: SDK 会自动生成 UUID 并保存到：
1. 优先使用 localStorage
2. 降级到 Cookie（10年有效期）
3. 最后降级到临时 UUID（每次刷新会变）

你也可以自定义设备 ID：
```javascript
Analytics.initialize({
  serverUrl: 'http://localhost:8080',
  productName: 'MyApp',
  deviceId: 'my-custom-device-id',
});
```

### Q: 如何处理网络错误？

A: 使用 `onError` 回调：
```javascript
Analytics.initialize({
  serverUrl: 'http://localhost:8080',
  productName: 'MyApp',
  onError: (error) => {
    console.error('Analytics error:', error);
    // 发送到你的错误监控服务
  },
});
```

### Q: TypeScript 类型支持？

A: SDK 完全支持 TypeScript，包含完整的类型定义：

```typescript
import Analytics, { AnalyticsConfig, EventProperties } from 'js-analysis-client';

const config: AnalyticsConfig = {
  serverUrl: 'http://localhost:8080',
  productName: 'MyApp',
  debug: true,
};

Analytics.initialize(config);

const props: EventProperties = {
  button: 'submit',
  page: '/login',
};

Analytics.track('button_click', props);
```

## 测试服务器连接

在浏览器控制台或 Node.js 中测试：

```javascript
// 测试健康检查
fetch('http://localhost:8080/api/health')
  .then(res => res.json())
  .then(data => console.log('Server status:', data));

// 测试事件上报
fetch('http://localhost:8080/api/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'test_event',
    product: 'TestApp',
    device_id: 'test-device-123',
    timestamp: Math.floor(Date.now() / 1000),
    properties: { test: true }
  })
})
.then(res => res.json())
.then(data => console.log('Event response:', data));
```

## 下一步

1. ✅ 查看完整的 [README.md](README.md) 了解所有 API
2. ✅ 查看 [examples/basic.html](examples/basic.html) 浏览器示例
3. ✅ 查看 [examples/node-example.js](examples/node-example.js) Node.js 示例
4. ✅ 在你的项目中集成 SDK
5. ✅ 查看 [Go Analysis Server 文档](../go-analysis-server/README.md)
6. ✅ 访问 [管理后台](../go-analysis-frontend) 查看数据

## 开发建议

- 在开发环境启用 `debug: true`
- 在生产环境使用较大的 `batchSize` 和 `flushInterval` 以减少请求
- 使用 `Analytics.flush()` 确保重要事件立即发送
- 在页面卸载前事件会自动刷新，无需手动处理

---

**有问题？** 查看 [README.md](README.md) 或提交 [Issue](../../issues)
