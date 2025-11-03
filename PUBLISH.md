# 🚀 快速发布到 NPM

## 5 步完成发布

### 1️⃣ 更新 package.json 中的包名和作者信息

```json
{
  "name": "@your-npm-username/ts-analysis-client",
  "author": "Your Name <your.email@example.com>"
}
```

**推荐使用作用域包名** `@your-npm-username/ts-analysis-client`，可以避免包名冲突。

### 2️⃣ 登录 NPM

```bash
npm login
```

输入你的 NPM 用户名、密码和邮箱。

验证登录：
```bash
npm whoami
```

### 3️⃣ 安装依赖并构建

```bash
cd /Users/apple/opt/difyz10/1027/ts-analysis-client
npm install
npm run build
```

### 4️⃣ 发布到 NPM

**如果是作用域包**（推荐）：
```bash
npm publish --access public
```

**如果是普通包**：
```bash
npm publish
```

### 5️⃣ 验证发布成功

访问：`https://www.npmjs.com/package/your-package-name`

测试安装：
```bash
npm install your-package-name
```

---

## 📝 发布后用户如何使用

### 安装

```bash
npm install @your-username/ts-analysis-client
```

### 使用

```javascript
import Analytics from '@your-username/ts-analysis-client';

// 初始化
Analytics.initialize({
  serverUrl: 'http://localhost:8080',
  productName: 'MyApp',
  debug: true,
});

// 追踪事件
Analytics.track('button_click', {
  button: 'test',
  page: '/home'
});

// 追踪页面浏览
Analytics.trackPageView('/home', 'Home Page');

// 上报安装
Analytics.reportInstall();
```

---

## 🔄 后续版本更新

```bash
# 修改代码后

# 1. 更新版本号（选择一个）
npm version patch   # 1.0.0 → 1.0.1 (bug修复)
npm version minor   # 1.0.0 → 1.1.0 (新功能)
npm version major   # 1.0.0 → 2.0.0 (破坏性变更)

# 2. 重新构建
npm run build

# 3. 发布
npm publish --access public

# 4. 推送到 Git
git push
git push --tags
```

---

## ⚠️ 注意事项

1. **包名选择**：
   - ✅ 推荐：`@difyz9/ts-analysis-client`（作用域包）
   - ⚠️ 需检查：`ts-analysis-client`（可能被占用）

2. **首次发布作用域包**必须加 `--access public`

3. **更新作者信息**：将 package.json 中的 `"author": "Your Name"` 改为真实信息

4. **确保构建成功**：dist 目录必须包含所有文件

---

## 📚 详细文档

- **完整发布指南**：查看 [NPM_PUBLISH_GUIDE.md](./NPM_PUBLISH_GUIDE.md)
- **使用文档**：查看 [README.md](./README.md)
- **快速开始**：查看 [QUICK_START.md](./QUICK_START.md)

---

## 🆘 遇到问题？

### 包名被占用
```bash
# 改用作用域包名
"name": "@your-username/ts-analysis-client"
```

### 需要登录
```bash
npm login
```

### 作用域包发布失败
```bash
# 添加 --access public
npm publish --access public
```

### 检查包名是否可用
```bash
npm search package-name
```

---

**准备好了？立即开始发布！** 🎉

```bash
cd /Users/apple/opt/difyz10/1027/ts-analysis-client
npm install
npm run build
npm login
npm publish --access public
```
