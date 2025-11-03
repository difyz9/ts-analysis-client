#!/bin/bash

# 发布前检查脚本
# 用法: ./scripts/pre-publish-check.sh

set -e  # 遇到错误立即退出

echo "🔍 开始发布前检查..."
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_pass() {
  echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
  echo -e "${RED}✗${NC} $1"
  exit 1
}

check_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# 1. 检查是否在正确的目录
if [ ! -f "package.json" ]; then
  check_fail "当前目录不是项目根目录（找不到 package.json）"
fi
check_pass "项目目录检查通过"

# 2. 检查 Node.js 和 npm
if ! command -v node &> /dev/null; then
  check_fail "未安装 Node.js"
fi
check_pass "Node.js 版本: $(node -v)"

if ! command -v npm &> /dev/null; then
  check_fail "未安装 npm"
fi
check_pass "npm 版本: $(npm -v)"

# 3. 检查 npm 登录状态
if ! npm whoami &> /dev/null; then
  check_fail "未登录 npm，请运行: npm login"
fi
NPM_USER=$(npm whoami)
check_pass "npm 已登录: $NPM_USER"

# 4. 检查 package.json 必要字段
PACKAGE_NAME=$(node -p "require('./package.json').name")
PACKAGE_VERSION=$(node -p "require('./package.json').version")
PACKAGE_AUTHOR=$(node -p "require('./package.json').author || 'undefined'")

if [ -z "$PACKAGE_NAME" ]; then
  check_fail "package.json 缺少 name 字段"
fi
check_pass "包名: $PACKAGE_NAME"

if [ -z "$PACKAGE_VERSION" ]; then
  check_fail "package.json 缺少 version 字段"
fi
check_pass "版本: $PACKAGE_VERSION"

if [ "$PACKAGE_AUTHOR" = "undefined" ] || [ "$PACKAGE_AUTHOR" = "Your Name" ]; then
  check_warn "请更新 package.json 中的 author 字段"
else
  check_pass "作者: $PACKAGE_AUTHOR"
fi

# 5. 检查必要文件
if [ ! -f "README.md" ]; then
  check_fail "缺少 README.md 文件"
fi
check_pass "README.md 存在"

if [ ! -f "LICENSE" ]; then
  check_warn "缺少 LICENSE 文件，建议添加"
else
  check_pass "LICENSE 存在"
fi

# 6. 检查 node_modules
if [ ! -d "node_modules" ]; then
  check_warn "未安装依赖，运行: npm install"
  echo "正在安装依赖..."
  npm install
fi
check_pass "依赖已安装"

# 7. 构建项目
echo ""
echo "📦 开始构建..."
if ! npm run build; then
  check_fail "构建失败"
fi
check_pass "构建成功"

# 8. 检查构建产物
if [ ! -d "dist" ]; then
  check_fail "dist 目录不存在"
fi

REQUIRED_FILES=("dist/index.js" "dist/index.esm.js" "dist/index.d.ts")
for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    check_fail "缺少构建文件: $file"
  fi
done
check_pass "构建产物完整"

# 9. 检查包名是否已被占用（仅非作用域包）
if [[ ! $PACKAGE_NAME =~ ^@ ]]; then
  echo ""
  echo "🔎 检查包名可用性..."
  if npm view "$PACKAGE_NAME" &> /dev/null; then
    check_warn "包名 '$PACKAGE_NAME' 已被占用"
    echo "   建议使用作用域包名: @$NPM_USER/ts-analysis-client"
    echo "   或更改包名"
  else
    check_pass "包名 '$PACKAGE_NAME' 可用"
  fi
fi

# 10. 预览发布内容
echo ""
echo "📋 将要发布的文件列表:"
echo "-----------------------------------"
npm pack --dry-run 2>&1 | grep -E "^\s+" || true
echo "-----------------------------------"

# 11. 最终确认
echo ""
echo -e "${GREEN}✓ 所有检查通过！${NC}"
echo ""
echo "准备发布："
echo "  包名: $PACKAGE_NAME"
echo "  版本: $PACKAGE_VERSION"
echo "  npm用户: $NPM_USER"
echo ""
echo "执行以下命令发布："
echo ""

if [[ $PACKAGE_NAME =~ ^@ ]]; then
  echo "  ${YELLOW}npm publish --access public${NC}"
else
  echo "  ${YELLOW}npm publish${NC}"
fi

echo ""
echo "或运行自动发布脚本："
echo "  ${YELLOW}./scripts/publish.sh${NC}"
