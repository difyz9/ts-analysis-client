# 📦 发布到 NPM 指南

## 前置准备

### 1. 注册 NPM 账号

如果还没有 NPM 账号：

1. 访问 https://www.npmjs.com/signup
2. 注册一个免费账号
3. 验证邮箱

### 2. 登录 NPM

在终端中登录：

```bash
npm login
```

输入：
- Username（用户名）
- Password（密码）
- Email（邮箱）
- 可能需要输入 2FA 验证码

验证登录状态：
```bash
npm whoami
```

## 发布步骤

### 方式一：发布公共包（推荐，免费）

#### 步骤 1: 更新 package.json

如果使用无作用域的包名（公共包）：

```json
{
  "name": "ts-analysis-client",
  "version": "1.0.0",
  ...
}
```

⚠️ **注意**：包名 `ts-analysis-client` 可能已被占用。检查方法：

```bash
npm search ts-analysis-client
```

如果已被占用，需要改名：
- `your-name-analytics-client`
- `go-analysis-js-client`
- `ga-js-sdk`

#### 步骤 2: 构建项目

```bash
npm install
npm run build
```

确保 `dist/` 目录已生成：
```bash
ls -la dist/
```

应该看到：
- `index.js`
- `index.esm.js`
- `index.umd.js`
- `index.d.ts`

#### 步骤 3: 测试打包内容

查看将要发布的文件：

```bash
npm pack --dry-run
```

这会显示所有将被包含的文件。

#### 步骤 4: 发布

```bash
npm publish
```

如果是第一次发布包，可能需要加上 `--access public`：

```bash
npm publish --access public
```

#### 步骤 5: 验证发布

访问：`https://www.npmjs.com/package/ts-analysis-client`

或测试安装：
```bash
npm install ts-analysis-client
```

---

### 方式二：发布作用域包（推荐，更专业）

作用域包格式：`@username/package-name`

#### 优势：
- ✅ 包名不容易冲突
- ✅ 可以发布私有包（付费功能）
- ✅ 更专业的命名空间

#### 步骤 1: 更新 package.json

```json
{
  "name": "@difyz9/ts-analysis-client",
  "version": "1.0.0",
  ...
}
```

**替换 `difyz9` 为你的 npm 用户名！**

#### 步骤 2: 构建

```bash
npm install
npm run build
```

#### 步骤 3: 发布

作用域包默认是私有的，需要指定为公共：

```bash
npm publish --access public
```

#### 步骤 4: 用户安装

```bash
npm install @difyz9/ts-analysis-client
```

使用时：
```javascript
import Analytics from '@difyz9/ts-analysis-client';
```

---

## 更新版本

### 语义化版本规则

- **补丁版本**（Bug 修复）：`1.0.0` → `1.0.1`
  ```bash
  npm version patch
  ```

- **次版本**（新功能，向后兼容）：`1.0.0` → `1.1.0`
  ```bash
  npm version minor
  ```

- **主版本**（破坏性变更）：`1.0.0` → `2.0.0`
  ```bash
  npm version major
  ```

### 发布更新

```bash
# 1. 修改代码
# 2. 提交到 Git
git add .
git commit -m "feat: add new feature"

# 3. 更新版本（自动创建 git tag）
npm version patch

# 4. 发布
npm publish

# 5. 推送 tag 到远程
git push --tags
```

---

## 完整发布流程（推荐）

### 第一次发布

```bash
# 1. 确保在正确的目录
cd /Users/apple/opt/difyz10/1027/ts-analysis-client

# 2. 确定包名（二选一）

# 选项 A: 公共包名（需要检查是否被占用）
# 编辑 package.json: "name": "ts-analysis-client"

# 选项 B: 作用域包名（推荐）
# 编辑 package.json: "name": "@your-npm-username/ts-analysis-client"

# 3. 更新作者信息
# 编辑 package.json: "author": "Your Name <your.email@example.com>"

# 4. 安装依赖
npm install

# 5. 运行构建
npm run build

# 6. 测试构建产物
ls -la dist/

# 7. 预览将要发布的内容
npm pack --dry-run

# 8. 登录 npm（如果还没登录）
npm login

# 9. 发布（根据包名类型选择命令）

# 如果是公共包：
npm publish

# 如果是作用域包：
npm publish --access public

# 10. 验证发布
npm info ts-analysis-client
# 或
npm info @your-username/ts-analysis-client
```

### 后续更新发布

```bash
# 1. 修改代码
# 2. 测试
npm run build

# 3. 提交到 Git
git add .
git commit -m "fix: bug description"

# 4. 更新版本号（选择一个）
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0

# 5. 发布
npm publish

# 6. 推送到 Git
git push
git push --tags
```

---

## 常见问题

### Q1: 包名已被占用怎么办？

**错误信息**：
```
403 Forbidden - PUT https://registry.npmjs.org/ts-analysis-client - You do not have permission to publish "ts-analysis-client".
```

**解决方案**：
1. 改用作用域包名：`@your-username/ts-analysis-client`
2. 或更改包名：`your-name-analytics-sdk`

### Q2: 需要登录

**错误信息**：
```
npm ERR! code ENEEDAUTH
npm ERR! need auth This command requires you to be logged in.
```

**解决方案**：
```bash
npm login
```

### Q3: 发布作用域包失败

**错误信息**：
```
402 Payment Required - You must sign up for private packages
```

**解决方案**：
添加 `--access public` 参数：
```bash
npm publish --access public
```

### Q4: 版本号已存在

**错误信息**：
```
403 Forbidden - You cannot publish over the previously published versions
```

**解决方案**：
更新版本号：
```bash
npm version patch
npm publish
```

### Q5: 如何撤销发布？

在发布后 72 小时内可以撤销：

```bash
# 撤销特定版本
npm unpublish package-name@1.0.0

# 撤销整个包（慎用！）
npm unpublish package-name --force
```

⚠️ **注意**：撤销后的包名 24 小时内不能重新发布。

---

## 发布检查清单

发布前确认：

- [ ] ✅ package.json 中的包名正确且未被占用
- [ ] ✅ version 版本号正确
- [ ] ✅ description 描述清晰
- [ ] ✅ author 作者信息完整
- [ ] ✅ repository 仓库地址正确
- [ ] ✅ keywords 关键词齐全
- [ ] ✅ LICENSE 文件存在
- [ ] ✅ README.md 文档完善
- [ ] ✅ 运行 `npm run build` 成功
- [ ] ✅ dist/ 目录包含所有构建产物
- [ ] ✅ 已登录 npm (`npm whoami`)
- [ ] ✅ 运行 `npm pack --dry-run` 检查内容

---

## 推荐的包名

根据您的项目，建议使用以下包名（按优先级）：

1. **@difyz9/ts-analysis-client** ⭐ 推荐
   - 作用域包，不会冲突
   - 专业且清晰

2. **go-analysis-js-sdk**
   - 描述性强
   - 与项目名称对应

3. **ga-js-client**
   - 简短
   - 容易记忆

4. **analytics-js-tracker**
   - 通用性强
   - SEO 友好

---

## 发布后

### 1. 更新 README.md

添加安装说明：

```markdown
## Installation

\`\`\`bash
npm install @difyz9/ts-analysis-client
\`\`\`

## Usage

\`\`\`javascript
import Analytics from '@difyz9/ts-analysis-client';

Analytics.initialize({
  serverUrl: 'http://localhost:8080',
  productName: 'MyApp',
});

Analytics.track('event_name', { key: 'value' });
\`\`\`
```

### 2. 添加徽章

在 README.md 顶部添加：

```markdown
[![npm version](https://img.shields.io/npm/v/@difyz9/ts-analysis-client.svg)](https://www.npmjs.com/package/@difyz9/ts-analysis-client)
[![npm downloads](https://img.shields.io/npm/dm/@difyz9/ts-analysis-client.svg)](https://www.npmjs.com/package/@difyz9/ts-analysis-client)
[![license](https://img.shields.io/npm/l/@difyz9/ts-analysis-client.svg)](https://github.com/difyz9/go-analysis-example/blob/main/ts-analysis-client/LICENSE)
```

### 3. 创建 CHANGELOG.md

记录版本更新：

```markdown
# Changelog

## [1.0.0] - 2025-11-03

### Added
- Initial release
- Event tracking functionality
- License management
- Device info collection
- Batch event sending
```

### 4. 宣传推广

- 在 GitHub 仓库添加 npm 链接
- 在项目文档中更新安装方式
- 社交媒体分享

---

## 快速命令参考

```bash
# 检查包名是否可用
npm search package-name

# 查看将要发布的文件
npm pack --dry-run

# 查看包信息
npm info package-name

# 查看自己发布的所有包
npm profile get

# 查看包的下载统计
npm view package-name

# 添加 collaborators
npm owner add username package-name
```

---

## 需要帮助？

- NPM 官方文档：https://docs.npmjs.com/
- 发布指南：https://docs.npmjs.com/cli/v10/commands/npm-publish
- 包命名规范：https://docs.npmjs.com/cli/v10/configuring-npm/package-json#name

---

**准备好了吗？开始发布您的第一个 NPM 包！** 🚀
