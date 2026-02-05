import { browser } from 'wxt/browser';
import {
  flattenFolders,
  getFolderTitle,
  type BookmarkTreeNode,
} from '../utils/bookmark-helpers';

/**
 * UI メッセージ定数（将来のi18n対応のために構造化）
 */
const MESSAGES = {
  LOADING: '読み込み中...',
  SAVE_SUCCESS: '保存しました！',
  NO_FOLDERS: 'フォルダが見つかりませんでした。',
  BOOKMARK_ERROR:
    'ブックマークの読み込みに失敗しました。ページを再読み込みしてください。',
  STORAGE_SAVE_ERROR:
    '設定の保存に失敗しました。もう一度お試しください。',
  FOLDER_COUNT_WARNING:
    '注意: フォルダ数が多いため、表示に時間がかかる場合があります。',
} as const;

/**
 * FolderSelectorコンポーネントのオプション設定
 */
export interface FolderSelectorOptions {
  /** フォルダ数警告を表示するか（デフォルト: false） */
  showFolderCountWarning?: boolean;

  /** 警告を表示するフォルダ数の閾値（デフォルト: 100） */
  folderCountThreshold?: number;

  /** 保存処理のデバウンス時間（ミリ秒、デフォルト: 0 = デバウンスなし） */
  debounceDelay?: number;

  /** 保存成功時のメッセージ（デフォルト: MESSAGES.SAVE_SUCCESS） */
  successMessage?: string;
}

/**
 * ブックマークフォルダ選択UIを管理するコンポーネント
 */
export class FolderSelector {
  private selectElement: HTMLSelectElement;
  private statusElement: HTMLDivElement;
  private options: Required<FolderSelectorOptions>;
  private saveTimer?: number;
  private boundHandleChange: () => Promise<void>;

  /**
   * コンストラクタ
   * @param selectElement - フォルダ選択用のselect要素
   * @param statusElement - ステータスメッセージ表示用のdiv要素
   * @param options - オプション設定
   * @throws {Error} selectElementまたはstatusElementがnull/undefinedの場合
   */
  constructor(
    selectElement: HTMLSelectElement,
    statusElement: HTMLDivElement,
    options?: FolderSelectorOptions
  ) {
    // DOM要素のバリデーション
    if (!selectElement || !statusElement) {
      console.error('必要なDOM要素が見つかりません');
      throw new Error('DOM要素の取得に失敗しました');
    }

    this.selectElement = selectElement;
    this.statusElement = statusElement;

    // オプションのデフォルト値設定
    this.options = {
      showFolderCountWarning: options?.showFolderCountWarning ?? false,
      folderCountThreshold: options?.folderCountThreshold ?? 100,
      debounceDelay: options?.debounceDelay ?? 0,
      successMessage: options?.successMessage ?? MESSAGES.SAVE_SUCCESS,
    };

    // イベントハンドラーをバインド（destroy時に削除できるように）
    this.boundHandleChange = this.handleSelectionChange.bind(this);
  }

  /**
   * コンポーネントを初期化する
   * ブックマークフォルダを読み込み、ドロップダウンに表示し、
   * 保存済み設定を復元する
   */
  async init(): Promise<void> {
    await this.loadFolders();
    await this.loadSavedSelection();
    this.setupEventListeners();
  }

  /**
   * コンポーネントを破棄し、リソースをクリーンアップする
   * タイマーのクリアとイベントリスナーの削除を行う
   */
  destroy(): void {
    // タイマーをクリア
    if (this.saveTimer !== undefined) {
      clearTimeout(this.saveTimer);
      this.saveTimer = undefined;
    }

    // イベントリスナーを削除
    this.selectElement.removeEventListener('change', this.boundHandleChange);
  }

  /**
   * ブックマークツリーを取得し、ドロップダウンに追加
   */
  private async loadFolders(): Promise<void> {
    try {
      this.showStatus(MESSAGES.LOADING);

      // ブックマークツリーを取得
      const tree = await browser.bookmarks.getTree();
      const folders = flattenFolders(tree);

      if (folders.length === 0) {
        this.showStatus(MESSAGES.NO_FOLDERS);
        return;
      }

      // フォルダ数チェックと警告表示（オプション）
      if (
        this.options.showFolderCountWarning &&
        folders.length > this.options.folderCountThreshold
      ) {
        this.showWarning(MESSAGES.FOLDER_COUNT_WARNING);
      }

      // ドロップダウンにフォルダを追加
      folders.forEach((folder) => {
        const title = getFolderTitle(folder);
        const option = document.createElement('option');
        option.value = folder.id;
        option.textContent = title;
        this.selectElement.appendChild(option);
      });

      this.showStatus(''); // ステータスをクリア
    } catch (error) {
      console.error('ブックマーク取得エラー:', error);
      this.showStatus(MESSAGES.BOOKMARK_ERROR);
    }
  }

  /**
   * 保存済みフォルダIDを読み込み、選択状態を復元
   */
  private async loadSavedSelection(): Promise<void> {
    try {
      const result = await browser.storage.local.get('targetFolderId');
      const targetFolderId = result.targetFolderId as string | undefined;
      if (targetFolderId) {
        this.selectElement.value = targetFolderId;
      }
    } catch (error) {
      console.error('設定読み込みエラー:', error);
      // エラーでも初期表示は継続（デフォルト選択のまま）
    }
  }

  /**
   * select要素のchangeイベントリスナーを設定
   */
  private setupEventListeners(): void {
    this.selectElement.addEventListener('change', this.boundHandleChange);
  }

  /**
   * フォルダ選択変更時の処理（デバウンス、バリデーション、保存）
   */
  private async handleSelectionChange(): Promise<void> {
    // 前回のタイマーをクリア（デバウンス処理）
    if (this.saveTimer !== undefined) {
      clearTimeout(this.saveTimer);
    }

    // デバウンス処理
    if (this.options.debounceDelay > 0) {
      this.saveTimer = window.setTimeout(async () => {
        await this.saveSelection();
      }, this.options.debounceDelay);
    } else {
      // デバウンスなしの場合は即座に保存
      await this.saveSelection();
    }
  }

  /**
   * 選択されたフォルダIDを保存
   */
  private async saveSelection(): Promise<void> {
    const folderId = this.selectElement.value;

    // 空選択は保存しない
    if (!folderId || folderId.trim() === '') {
      return;
    }

    try {
      await browser.storage.local.set({ targetFolderId: folderId });
      this.showStatus(this.options.successMessage, 2000);
    } catch (error) {
      console.error('設定保存エラー:', error);
      this.showStatus(MESSAGES.STORAGE_SAVE_ERROR);
    }
  }

  /**
   * ステータスメッセージを表示（オプションで自動クリア）
   * @param message - 表示するメッセージ
   * @param duration - 自動クリアまでの時間（ミリ秒、0で自動クリアなし）
   */
  private showStatus(message: string, duration?: number): void {
    this.statusElement.textContent = message;

    // duration > 0の場合、自動クリア
    if (duration && duration > 0) {
      setTimeout(() => {
        this.statusElement.textContent = '';
      }, duration);
    }
  }

  /**
   * 警告メッセージをselect要素の前に挿入
   * @param message - 警告メッセージ
   */
  private showWarning(message: string): void {
    const warning = document.createElement('div');
    warning.className = 'warning';
    warning.textContent = message;
    this.selectElement.parentElement?.insertBefore(warning, this.selectElement);
  }
}
