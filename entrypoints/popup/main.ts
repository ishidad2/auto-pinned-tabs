import { browser } from 'wxt/browser';
import { flattenFolders, getFolderTitle } from '../../utils/bookmark-helpers';

// DOM要素の取得と型定義
const select = document.getElementById('folderSelect') as HTMLSelectElement;
const status = document.getElementById('status') as HTMLDivElement;

// DOM要素の存在チェック
if (!select || !status) {
  console.error('必要なDOM要素が見つかりません');
  throw new Error('DOM要素の取得に失敗しました');
}

// デバウンス用のタイマー
let saveTimer: number | undefined;

/**
 * ポップアップの初期化処理
 * ブックマークフォルダを取得し、ドロップダウンに表示する
 */
async function initPopup(): Promise<void> {
  try {
    status.textContent = '読み込み中...';

    // ブックマークツリーを取得
    const tree = await browser.bookmarks.getTree();
    const folders = flattenFolders(tree);

    if (folders.length === 0) {
      status.textContent = 'フォルダが見つかりませんでした。';
      return;
    }

    // 100フォルダ超過時の警告表示
    if (folders.length > 100) {
      const warning = document.createElement('div');
      warning.className = 'warning';
      warning.textContent = '注意: フォルダ数が多いため、表示に時間がかかる場合があります。';
      document.body.insertBefore(warning, select);
    }

    // ドロップダウンにフォルダを追加
    folders.forEach(folder => {
      const title = getFolderTitle(folder);
      const option = document.createElement('option');
      option.value = folder.id;
      option.textContent = title;
      select.appendChild(option);
    });

    // 保存済み設定を読み込み
    try {
      const result = await browser.storage.local.get('targetFolderId');
      const targetFolderId = result.targetFolderId as string | undefined;
      if (targetFolderId) {
        select.value = targetFolderId;
      }
    } catch (error) {
      console.error('設定読み込みエラー:', error);
      // エラーでも初期表示は継続
    }

    status.textContent = ''; // 読み込み完了後にステータスをクリア
  } catch (error) {
    console.error('ブックマーク取得エラー:', error);
    status.textContent = 'ブックマークの読み込みに失敗しました。ページを再読み込みしてください。';
  }
}

// フォルダ選択イベントハンドラー
select.addEventListener('change', async () => {
  // 前回のタイマーをクリア（デバウンス処理）
  if (saveTimer !== undefined) {
    clearTimeout(saveTimer);
  }

  // 最新の選択のみを保存（300msのデバウンス）
  saveTimer = window.setTimeout(async () => {
    const folderId = select.value;

    // 空選択は保存しない
    if (!folderId || folderId.trim() === '') {
      return;
    }

    try {
      await browser.storage.local.set({ targetFolderId: folderId });
      status.textContent = '保存しました！';
      setTimeout(() => {
        status.textContent = '';
      }, 2000);
    } catch (error) {
      console.error('設定保存エラー:', error);
      status.textContent = '設定の保存に失敗しました。もう一度お試しください。';
    }
  }, 300);
});

// ポップアップ初期化を実行
initPopup().catch((error) => {
  console.error('ポップアップ初期化エラー:', error);
});
