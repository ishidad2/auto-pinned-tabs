import { browser } from 'wxt/browser';

/**
 * ブックマーク関連のユーティリティ関数
 */

/**
 * ブックマークツリーのノード型
 */
export interface BookmarkTreeNode {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkTreeNode[];
}

/**
 * ブックマークツリーから再帰的にフォルダのみを抽出
 * @param nodes - ブックマークツリーのノード配列
 * @returns フォルダノードの配列（URLを持たないノードのみ）
 */
export function flattenFolders(
  nodes: BookmarkTreeNode[]
): BookmarkTreeNode[] {
  let results: BookmarkTreeNode[] = [];
  for (const node of nodes) {
    // URLを持たないノード = フォルダ
    if (!node.url) {
      // ルートフォルダ（id === '0'）は除外
      if (node.id !== '0') {
        results.push(node);
      }
      if (node.children) {
        results = results.concat(flattenFolders(node.children));
      }
    }
  }
  return results;
}

/**
 * フォルダのタイトルを取得（無題の場合はフォールバック）
 * ルートフォルダ（id === '0'）は特別扱いで i18n キー 'folderRoot' を使用
 * タイトルがない場合は i18n キー 'folderUntitled' を使用
 * @param folder - ブックマークフォルダノード
 * @returns 表示用のタイトル
 */
export function getFolderTitle(
  folder: BookmarkTreeNode
): string {
  if (folder.title) return folder.title;
  if (folder.id === '0') return browser.i18n.getMessage('folderRoot') || 'Root';
  return browser.i18n.getMessage('folderUntitled', folder.id)
    || `(${folder.id})`;
}
