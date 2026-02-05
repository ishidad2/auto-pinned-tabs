#!/bin/bash

# リリーススクリプト
# 使い方: ./scripts/release.sh [patch|minor|major]

set -e

# 色の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# エラーハンドリング
error_exit() {
    echo -e "${RED}エラー: $1${NC}" >&2
    exit 1
}

# 成功メッセージ
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# 警告メッセージ
warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# mainブランチにいることを確認
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    error_exit "mainブランチにいません。現在のブランチ: $current_branch"
fi

# 未コミットの変更がないことを確認
if [ -n "$(git status --porcelain)" ]; then
    warning "未コミットの変更があります。"
    git status --short
    read -p "続行しますか？ (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# リモートから最新の変更を取得
echo "リモートから最新の変更を取得中..."
git fetch origin

# ローカルとリモートが同期していることを確認
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
if [ $LOCAL != $REMOTE ]; then
    error_exit "ローカルとリモートが同期していません。git pull を実行してください。"
fi

# 現在のバージョンを表示
current_version=$(node -p "require('./package.json').version")
echo "現在のバージョン: v$current_version"

# バージョンタイプの決定
version_type=${1:-}
if [ -z "$version_type" ]; then
    echo ""
    echo "バージョンアップのタイプを選択してください:"
    echo "  1) patch (バグ修正) - 例: 1.0.0 → 1.0.1"
    echo "  2) minor (機能追加) - 例: 1.0.0 → 1.1.0"
    echo "  3) major (破壊的変更) - 例: 1.0.0 → 2.0.0"
    read -p "選択 (1-3): " choice

    case $choice in
        1) version_type="patch" ;;
        2) version_type="minor" ;;
        3) version_type="major" ;;
        *) error_exit "無効な選択です" ;;
    esac
fi

# バージョンタイプの検証
if [[ ! "$version_type" =~ ^(patch|minor|major)$ ]]; then
    error_exit "無効なバージョンタイプです。patch, minor, または major を指定してください。"
fi

# TypeScriptのコンパイルチェック
echo ""
echo "TypeScriptのコンパイルチェックを実行中..."
if npm run compile; then
    success "TypeScriptのコンパイルチェック完了"
else
    error_exit "TypeScriptのコンパイルエラーがあります"
fi

# ビルドのテスト
echo ""
echo "Chrome版のビルドをテスト中..."
if npm run build > /dev/null 2>&1; then
    success "Chrome版のビルド成功"
else
    error_exit "Chrome版のビルドに失敗しました"
fi

echo "Firefox版のビルドをテスト中..."
if npm run build:firefox > /dev/null 2>&1; then
    success "Firefox版のビルド成功"
else
    error_exit "Firefox版のビルドに失敗しました"
fi

# バージョンを更新
echo ""
echo "バージョンを更新中..."
new_version=$(npm version $version_type --no-git-tag-version)
success "バージョンを $new_version に更新しました"

# コミットメッセージの入力
echo ""
read -p "追加のコミットメッセージ (省略可): " additional_message

commit_message="chore: Bump version to $new_version"
if [ -n "$additional_message" ]; then
    commit_message="$commit_message

$additional_message"
fi

# 変更をコミット
echo ""
echo "変更をコミット中..."
git add package.json package-lock.json
git commit -m "$commit_message"
success "コミット完了"

# タグを作成
echo ""
echo "タグを作成中..."
git tag $new_version
success "タグ $new_version を作成しました"

# 最終確認
echo ""
echo "=========================================="
echo "リリース準備完了"
echo "=========================================="
echo "バージョン: $new_version"
echo "コミット: $(git log -1 --oneline)"
echo ""
warning "これからmainブランチとタグをリモートにプッシュします。"
warning "プッシュ後、GitHub Actionsが自動的にリリースを作成します。"
echo ""
read -p "プッシュしますか？ (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "プッシュ中..."
    git push origin main
    git push origin $new_version

    echo ""
    success "リリース完了！"
    echo ""
    echo "次のステップ:"
    echo "  1. GitHub Actionsの進行状況を確認: https://github.com/ishidad2/auto-pinned-tabs/actions"
    echo "  2. リリースを確認: https://github.com/ishidad2/auto-pinned-tabs/releases"
    echo "  3. Chrome Web Storeに公開"
    echo "  4. Firefox Add-onsに公開"
else
    echo ""
    warning "プッシュをキャンセルしました。"
    echo ""
    echo "手動でプッシュする場合:"
    echo "  git push origin main"
    echo "  git push origin $new_version"
    echo ""
    echo "変更を取り消す場合:"
    echo "  git reset --hard HEAD~1"
    echo "  git tag -d $new_version"
fi
