#!/bin/bash

# NPM 发布脚本
# 用法: ./scripts/publish.sh [patch|minor|major]
# 例如: ./scripts/publish.sh patch

set -e

echo "🚀 开始 NPM 发布流程..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. 运行发布前检查
if [ -f "./scripts/pre-publish-check.sh" ]; then
  bash ./scripts/pre-publish-check.sh
else
  echo "警告: 未找到 pre-publish-check.sh，跳过检查"
fi

# 2. 确认版本更新类型
VERSION_TYPE=${1:-patch}  # 默认 patch

if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
  echo "错误: 版本类型必须是 patch, minor 或 major"
  echo "用法: ./scripts/publish.sh [patch|minor|major]"
  exit 1
fi

# 3. 获取当前版本
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo ""
echo "当前版本: $CURRENT_VERSION"

# 4. 更新版本
echo "更新版本类型: $VERSION_TYPE"
npm version $VERSION_TYPE --no-git-tag-version

NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}新版本: $NEW_VERSION${NC}"

# 5. 提交到 Git（如果有）
if [ -d ".git" ]; then
  echo ""
  echo "提交版本更新到 Git..."
  git add package.json package-lock.json
  git commit -m "chore: bump version to $NEW_VERSION"
  git tag "v$NEW_VERSION"
  echo -e "${GREEN}✓ Git 提交完成${NC}"
fi

# 6. 发布到 npm
echo ""
echo "📦 发布到 npm..."

PACKAGE_NAME=$(node -p "require('./package.json').name")

if [[ $PACKAGE_NAME =~ ^@ ]]; then
  # 作用域包需要 --access public
  npm publish --access public
else
  npm publish
fi

echo ""
echo -e "${GREEN}✓ 发布成功！${NC}"
echo ""
echo "包信息: https://www.npmjs.com/package/$PACKAGE_NAME"
echo "版本: $NEW_VERSION"

# 7. 推送到远程 Git（如果有）
if [ -d ".git" ]; then
  echo ""
  read -p "是否推送到远程仓库? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push
    git push --tags
    echo -e "${GREEN}✓ 已推送到远程仓库${NC}"
  fi
fi

echo ""
echo "🎉 发布完成！"
echo ""
echo "用户可以通过以下命令安装:"
echo "  ${YELLOW}npm install $PACKAGE_NAME${NC}"
