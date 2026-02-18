import { browser } from 'wxt/browser';
import { FolderSelector } from '../../components/FolderSelector';

const select = document.getElementById('folderSelect') as HTMLSelectElement;
const status = document.getElementById('status') as HTMLDivElement;

// html lang 属性をブラウザの言語設定に合わせて更新（アクセシビリティ向上）
document.documentElement.lang = browser.i18n.getUILanguage();

// 静的テキストを i18n で適用
// DOM 構造は index.html で静的に定義されているため non-null assertion を使用
// キー欠損時の空文字フォールバックとしてキー名自体を表示する
document.title =
  browser.i18n.getMessage('popupTitle') || 'popupTitle';
(document.querySelector('h3') as HTMLHeadingElement).textContent =
  browser.i18n.getMessage('popupHeading') || 'popupHeading';
(document.querySelector('label[for="folderSelect"]') as HTMLLabelElement).textContent =
  browser.i18n.getMessage('popupLabelSelect') || 'popupLabelSelect';
(document.querySelector('#folderSelect option[value=""]') as HTMLOptionElement).textContent =
  browser.i18n.getMessage('popupPlaceholder') || 'popupPlaceholder';
(document.querySelector('.support-link a span') as HTMLSpanElement).textContent =
  browser.i18n.getMessage('popupSupportLink') || 'popupSupportLink';

// FolderSelectorを初期化（popup固有オプション付き）
const folderSelector = new FolderSelector(select, status, {
  showFolderCountWarning: true,
  folderCountThreshold: 100,
  debounceDelay: 300,
});

folderSelector.init().catch((error) => {
  console.error('Popup initialization error:', error);
});
