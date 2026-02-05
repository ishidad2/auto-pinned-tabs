# リリース手順

このドキュメントでは、Auto Pinned Tabsの新バージョンをリリースする手順を説明します。

## 前提条件

- `main`ブランチが最新の状態であること
- すべてのテストが通ること
- TypeScriptのコンパイルエラーがないこと

## リリース手順

### 自動リリーススクリプトを使用（推奨）

リリーススクリプトを使用すると、バージョン更新からプッシュまでを自動化できます。

```bash
# 対話的にバージョンタイプを選択
npm run release

# またはバージョンタイプを指定
npm run release:patch  # バグ修正 (1.0.0 → 1.0.1)
npm run release:minor  # 機能追加 (1.0.0 → 1.1.0)
npm run release:major  # 破壊的変更 (1.0.0 → 2.0.0)
```

スクリプトは以下を自動的に実行します：

1. mainブランチにいることを確認
2. 未コミットの変更の確認
3. リモートとの同期確認
4. TypeScriptのコンパイルチェック
5. Chrome版・Firefox版のビルドテスト
6. バージョンの更新（package.json）
7. 変更のコミット
8. バージョンタグの作成
9. リモートへのプッシュ（確認後）

### 手動でリリース（スクリプトを使わない場合）

<details>
<summary>クリックして手動手順を表示</summary>

#### 1. バージョンの更新

`package.json`のバージョンを更新します。

```bash
# 例: 1.0.0 から 1.0.1 へ
npm version patch --no-git-tag-version

# または
npm version minor --no-git-tag-version  # マイナーバージョン
npm version major --no-git-tag-version  # メジャーバージョン
```

#### 2. 変更をコミット

```bash
git add package.json package-lock.json
git commit -m "chore: Bump version to v1.0.1"
```

#### 3. バージョンタグの作成とプッシュ

```bash
# タグを作成
git tag v1.0.1

# タグをリモートにプッシュ
git push origin main
git push origin v1.0.1
```

</details>

### GitHub Actionsワークフローの実行

タグをプッシュすると、自動的にGitHub Actionsワークフローが起動します。

ワークフローは以下の処理を実行します：

1. 依存関係のインストール（`npm ci`）
2. Chrome版のビルド（`npm run build`）
3. Firefox版のビルド（`npm run build:firefox`）
4. Chrome版のパッケージング（`auto-pinned-tabs-chrome-v1.0.1.zip`）
5. Firefox版のパッケージング（`auto-pinned-tabs-firefox-v1.0.1.zip`）
6. GitHubリリースの作成（リリースノート自動生成）

### 5. GitHubリリースの確認

1. GitHubリポジトリの[Releases](https://github.com/ishidad2/auto-pinned-tabs/releases)ページにアクセス
2. 新しいリリースが作成されていることを確認
3. Chrome版とFirefox版のzipファイルが添付されていることを確認
4. 自動生成されたリリースノートを確認し、必要に応じて編集

### 6. Chrome Web Storeへの公開

1. [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)にログイン
2. Auto Pinned Tabsの拡張機能を選択
3. 「パッケージ」タブから`auto-pinned-tabs-chrome-v1.0.1.zip`をアップロード
4. 変更内容を記載し、審査に提出

### 7. Firefox Add-onsへの公開

1. [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)にログイン
2. Auto Pinned Tabsのアドオンを選択
3. 「新しいバージョンをアップロード」から`auto-pinned-tabs-firefox-v1.0.1.zip`をアップロード
4. 変更内容を記載し、審査に提出

## リリース後の確認事項

- [ ] GitHubリリースが正常に作成されている
- [ ] Chrome版とFirefox版のzipファイルがダウンロード可能
- [ ] Chrome Web Storeでの審査状況を確認
- [ ] Firefox Add-onsでの審査状況を確認
- [ ] リリースノートが適切に記載されている

## トラブルシューティング

### GitHub Actionsワークフローが失敗した場合

1. [Actions](https://github.com/ishidad2/auto-pinned-tabs/actions)タブでエラーログを確認
2. ビルドエラーの場合は、ローカルで`npm run build`と`npm run build:firefox`を実行して確認
3. 修正後、タグを削除して再作成

```bash
# ローカルのタグを削除
git tag -d v1.0.1

# リモートのタグを削除
git push origin :refs/tags/v1.0.1

# 修正をコミット後、タグを再作成
git tag v1.0.1
git push origin v1.0.1
```

### パッケージングエラーの場合

`.output/chrome-mv3`または`.output/firefox-mv3`ディレクトリが正しく生成されているか確認します。

```bash
npm run build
ls -la .output/chrome-mv3

npm run build:firefox
ls -la .output/firefox-mv3
```

## バージョニング規則

このプロジェクトは[Semantic Versioning](https://semver.org/lang/ja/)に従います。

- **MAJOR**: 互換性のない大きな変更
- **MINOR**: 後方互換性のある機能追加
- **PATCH**: 後方互換性のあるバグ修正

## リリースノートのガイドライン

リリースノートには以下の情報を含めることを推奨します：

- **新機能**: 追加された新しい機能
- **改善**: 既存機能の改善
- **バグ修正**: 修正されたバグ
- **破壊的変更**: 互換性のない変更（該当する場合）
- **セキュリティ**: セキュリティ関連の修正（該当する場合）

GitHub Actionsによって自動生成されたリリースノートをベースに、必要に応じて編集してください。
