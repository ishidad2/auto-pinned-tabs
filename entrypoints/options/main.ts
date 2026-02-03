import { browser } from 'wxt/browser';
import { flattenFolders, getFolderTitle } from '../../utils/bookmark-helpers';

const select = document.getElementById('folderSelect') as HTMLSelectElement;
const status = document.getElementById('status') as HTMLDivElement;

// 1. 全てのブックマークフォルダを取得してプルダウンに追加
async function initOptions() {
  try {
    status.textContent = '読み込み中...';

    // getTree()を使って階層構造ごと取得し、再帰的にフォルダを抽出
    const tree = await browser.bookmarks.getTree();
    const folders = flattenFolders(tree);

    if (folders.length === 0) {
      status.textContent = 'フォルダが見つかりませんでした。';
      return;
    }

    folders.forEach(folder => {
      const title = getFolderTitle(folder);

      const option = document.createElement('option');
      option.value = folder.id;
      option.textContent = title;
      select.appendChild(option);
    });

    // 現在の設定を読み込み
    const result = await browser.storage.local.get('targetFolderId');
    const targetFolderId = result.targetFolderId as string | undefined;
    if (targetFolderId) {
      select.value = targetFolderId;
    }

    status.textContent = ''; // クリア
  } catch (error) {
    console.error(error);
    status.textContent = `エラーが発生しました: ${String(error)}`;
  }
}

// 2. 選択が変わったら自動保存
select.addEventListener('change', async () => {
  const folderId = select.value;
  if (!folderId) return; // 空選択は無視

  await browser.storage.local.set({ targetFolderId: folderId });
  status.textContent = '保存しました！';
  setTimeout(() => status.textContent = '', 2000);
});

initOptions();