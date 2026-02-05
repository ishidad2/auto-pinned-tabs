import { FolderSelector } from '../../components/FolderSelector';

const select = document.getElementById('folderSelect') as HTMLSelectElement;
const status = document.getElementById('status') as HTMLDivElement;

// FolderSelectorを初期化（popup固有オプション付き）
const folderSelector = new FolderSelector(select, status, {
  showFolderCountWarning: true,
  folderCountThreshold: 100,
  debounceDelay: 300,
});

folderSelector.init().catch((error) => {
  console.error('ポップアップ初期化エラー:', error);
});
