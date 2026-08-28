import { contextBridge } from 'electron';

/**
 * Renderer（React側）へ公開するAPIのブリッジ。
 * DB/認証/AIエージェント/ウィンドウ管理の各機能実装時に、
 * ここへ安全なIPC呼び出しを追加していく。
 */
contextBridge.exposeInMainWorld('engineAgentApi', {
  appVersion: process.env.npm_package_version ?? 'dev',
});
