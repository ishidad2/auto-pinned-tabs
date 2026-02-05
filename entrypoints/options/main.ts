import { FolderSelector } from '../../components/FolderSelector';

const select = document.getElementById('folderSelect') as HTMLSelectElement;
const status = document.getElementById('status') as HTMLDivElement;

// FolderSelectorを初期化（デフォルトオプション）
const folderSelector = new FolderSelector(select, status);
folderSelector.init();