/**
 * 安全なURLスキームかどうかを検証
 * @param url - 検証するURL
 * @returns http/httpsスキームの場合true、それ以外はfalse
 */
function isSafeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    // 不正なURL形式の場合はfalse
    return false;
  }
}

export default defineBackground(() => {
  browser.runtime.onStartup.addListener(async () => {
    // 保存されているフォルダIDを取得
    const res = await browser.storage.local.get('targetFolderId');
    const targetFolderId = res.targetFolderId;

    if (typeof targetFolderId !== 'string') return;

    try {
      // 既存の固定タブを取得
      const existingTabs = await browser.tabs.query({ pinned: true });

      // 固定タブが残っている場合は全て閉じる
      // （通常の起動では固定タブは残らないため、セッション復元などで残っている場合のクリーンアップ）
      if (existingTabs.length > 0) {
        for (const tab of existingTabs) {
          if (tab.id) {
            await browser.tabs.remove(tab.id);
          }
        }
      }

      // フォルダ内のブックマークを取得
      const children = await browser.bookmarks.getChildren(targetFolderId);

      // ブックマークから固定タブを開く
      for (const child of children) {
        if (child.url) {
          // セキュリティチェック: 安全なスキーム（http/https）のみ許可
          if (!isSafeUrl(child.url)) {
            console.warn('安全でないURLスキームのためスキップしました:', child.url);
            continue;
          }

          await browser.tabs.create({
            url: child.url,
            pinned: true
          });
        }
      }
    } catch (e) {
      console.error("フォルダの取得に失敗しました", e);
    }
  });

  // action.default_popup を設定したため、onClicked イベントは不要
});