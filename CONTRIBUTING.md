# コントリビューションガイド

Auto Pinned Tabsへのコントリビューションに興味を持っていただきありがとうございます。このドキュメントでは、開発フローとリリースプロセスについて説明します。

## 📋 目次

- [開発環境のセットアップ](#開発環境のセットアップ)
- [開発フロー](#開発フロー)
- [ブランチ戦略](#ブランチ戦略)
- [Pull Requestの作成](#pull-requestの作成)
- [ラベルの使い方](#ラベルの使い方)
- [コミットメッセージ規則](#コミットメッセージ規則)
- [リリースプロセス](#リリースプロセス)

---

## 開発環境のセットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/ishidad2/auto-pinned-tabs.git
cd auto-pinned-tabs
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 開発モードで起動

```bash
npm run dev
```

### 4. TypeScriptのチェック

```bash
npm run compile
```

---

## 開発フロー

このプロジェクトは**Pull Requestベース**で開発を進めます。これにより、綺麗なリリースノートが自動生成されます。

### 基本的な流れ

```
1. Issueを確認/作成
   ↓
2. 機能ブランチを作成
   ↓
3. コードを実装・コミット
   ↓
4. Pull Requestを作成
   ↓
5. レビュー（個人開発の場合はセルフレビュー）
   ↓
6. mainブランチにマージ
   ↓
7. 定期的にリリース
```

---

## ブランチ戦略

### ブランチ命名規則

ブランチ名は以下の形式に従ってください：

| タイプ | 命名規則 | 例 |
|--------|----------|-----|
| 新機能 | `feature/機能名` | `feature/dark-mode` |
| バグ修正 | `fix/バグ名` | `fix/tab-order-bug` |
| リファクタリング | `refactor/対象` | `refactor/folder-selector` |
| ドキュメント | `docs/対象` | `docs/update-readme` |
| UI改善 | `ui/対象` | `ui/popup-design` |
| テスト | `test/対象` | `test/bookmark-helpers` |
| その他 | `chore/対象` | `chore/update-deps` |

### 例：新機能の開発

```bash
# 1. mainブランチを最新にする
git checkout main
git pull origin main

# 2. 機能ブランチを作成
git checkout -b feature/export-settings

# 3. コードを実装
# ... 開発作業 ...

# 4. コミット
git add .
git commit -m "feat: 設定のエクスポート機能を追加"

# 5. リモートにプッシュ
git push origin feature/export-settings

# 6. GitHubでPull Requestを作成
```

---

## Pull Requestの作成

### 1. GitHub上でPRを作成

ブランチをプッシュ後、GitHubで「Compare & pull request」ボタンが表示されるのでクリックします。

### 2. PRテンプレートに従って記入

**タイトルの例:**
- `feat: 設定のエクスポート機能を追加`
- `fix: タブの重複バグを修正`
- `docs: READMEにインストール手順を追加`

**説明に含めるべき内容:**
- 何を変更したか
- なぜ変更したか
- どのようにテストしたか
- スクリーンショット（UI変更の場合）

### 3. ラベルを付与

**重要:** リリースノートの自動生成には、適切なラベルが必要です。

---

## ラベルの使い方

### ラベルとリリースノートのカテゴリー

| ラベル | リリースノートのカテゴリー | 使用例 |
|--------|---------------------------|--------|
| `enhancement`, `feature` | 🚀 新機能 | 新しい機能の追加 |
| `bug`, `fix` | 🐛 バグ修正 | バグの修正 |
| `documentation`, `docs` | 📚 ドキュメント | README更新など |
| `refactor`, `refactoring` | 🔧 リファクタリング | コードの整理 |
| `ui`, `ux`, `design` | 🎨 UI/UX改善 | デザイン改善 |
| `performance`, `perf` | ⚡ パフォーマンス改善 | 速度改善 |
| `security` | 🔒 セキュリティ | セキュリティ修正 |
| `test`, `testing` | 🧪 テスト | テストの追加 |
| `chore`, `ci`, `build` | 🔨 開発者向け改善 | ビルド設定など |

### ラベルの自動付与

ブランチ名やPRタイトルに基づいて、ラベルが自動的に付与されます：

- ブランチ `feature/xxx` → `enhancement` ラベル
- ブランチ `fix/xxx` → `bug` ラベル
- タイトル `feat:` → `enhancement` ラベル
- タイトル `fix:` → `bug` ラベル

手動でラベルを追加・変更することもできます。

### リリースノートから除外

`skip-changelog` ラベルを付けると、リリースノートに表示されません。

---

## コミットメッセージ規則

このプロジェクトは[Conventional Commits](https://www.conventionalcommits.org/ja/)に従います。

### フォーマット

```
<type>: <subject>

<body>（省略可）
```

### Type一覧

| Type | 説明 | 例 |
|------|------|-----|
| `feat` | 新機能 | `feat: ダークモード機能を追加` |
| `fix` | バグ修正 | `fix: タブ重複のバグを修正` |
| `docs` | ドキュメント | `docs: READMEを更新` |
| `refactor` | リファクタリング | `refactor: FolderSelectorを整理` |
| `test` | テスト追加 | `test: bookmark-helpersのテスト追加` |
| `chore` | その他 | `chore: 依存関係を更新` |
| `ci` | CI/CD | `ci: GitHub Actionsワークフロー追加` |
| `ui` | UI改善 | `ui: ポップアップデザイン改善` |
| `perf` | パフォーマンス | `perf: ブックマーク読み込み高速化` |

### コミットメッセージの例

**良い例:**
```bash
git commit -m "feat: 設定のインポート/エクスポート機能を追加"
git commit -m "fix: タブが正しく開かない問題を修正"
git commit -m "docs: リリース手順をREADMEに追加"
```

**悪い例:**
```bash
git commit -m "update"
git commit -m "fix bug"
git commit -m "色々修正"
```

---

## リリースプロセス

### 自動リリーススクリプトの使用（推奨）

```bash
# 1. mainブランチを最新にする
git checkout main
git pull origin main

# 2. リリーススクリプトを実行
npm run release          # 対話的にバージョンタイプを選択
npm run release:patch    # バグ修正 (0.1.0 → 0.1.1)
npm run release:minor    # 機能追加 (0.1.0 → 0.2.0)
npm run release:major    # 破壊的変更 (0.1.0 → 1.0.0)
```

スクリプトは以下を自動実行します：

1. ✅ mainブランチにいることを確認
2. ✅ 未コミット変更の確認
3. ✅ リモートとの同期確認
4. ✅ TypeScriptコンパイルチェック
5. ✅ 拡張機能のビルドテスト
6. ✅ バージョン番号の更新
7. ✅ 変更のコミット
8. ✅ バージョンタグの作成
9. ✅ リモートへのプッシュ（確認後）

### リリース後の自動処理

タグがプッシュされると、GitHub Actionsが自動的に：

1. 拡張機能をビルド
2. zipファイルとしてパッケージング
3. GitHubリリースを作成
4. リリースノートを自動生成（マージされたPRから）
5. zipファイルをリリースに添付

### リリースノートの自動生成

リリースノートは`.github/release.yml`の設定に基づいて自動生成されます。

**例: v0.2.0からv0.3.0までにマージされたPR**

```markdown
## 🚀 新機能
* 設定のエクスポート機能を追加 #5 @ishidad2
* ダークモード対応 #6 @contributor

## 🐛 バグ修正
* タブが開かない問題を修正 #7 @ishidad2

## 📚 ドキュメント
* コントリビューションガイドを追加 #8 @ishidad2

**Full Changelog**: https://github.com/ishidad2/auto-pinned-tabs/compare/v0.2.0...v0.3.0
```

各項目には：
- PRタイトル
- PR番号（クリック可能リンク）
- 作成者
- カテゴリー（ラベルに基づく）

が自動的に含まれます。

---

## ベストプラクティス

### ✅ DO（推奨）

- 機能追加・バグ修正は必ずPRを経由する
- PRには適切なラベルを付ける
- コミットメッセージはConventional Commitsに従う
- PRのタイトルと説明を丁寧に書く
- 変更内容が分かるスクリーンショットを添付（UI変更時）

### ❌ DON'T（非推奨）

- mainブランチに直接コミットしない
- 複数の無関係な変更を1つのPRにまとめない
- 曖昧なコミットメッセージ（「update」「fix」など）
- ラベルを付けずにマージする

---

## トラブルシューティング

### PRがリリースノートに表示されない

**原因:** ラベルが付いていない、または`skip-changelog`ラベルが付いている

**解決策:** PRに適切なラベルを追加する

### リリーススクリプトが失敗する

**原因:** 未コミットの変更がある、リモートと同期していない

**解決策:** エラーメッセージに従って対処する

```bash
# 未コミットの変更を確認
git status

# リモートと同期
git pull origin main
```

### GitHub Actionsでビルドが失敗する

**原因:** ローカルでビルドが通っていない

**解決策:** ローカルでビルドテストを実行

```bash
npm run compile
npm run build
```

---

## 質問・サポート

質問や提案がある場合は、以下の方法でお気軽にご連絡ください：

- **Issue**: [GitHub Issues](https://github.com/ishidad2/auto-pinned-tabs/issues)で質問や提案を投稿
- **Discussions**: 一般的な質問や議論は[GitHub Discussions](https://github.com/ishidad2/auto-pinned-tabs/discussions)で
- **Pull Request**: 改善案は直接PRとして提出

---

## ライセンス

このプロジェクトに貢献することで、あなたのコントリビューションがMITライセンスの下でライセンスされることに同意したものとみなされます。
