import { contextBridge, ipcRenderer } from 'electron';

/**
 * Renderer（React側）へ公開するAPIのブリッジ。
 * AIエージェント/ウィンドウ管理の機能実装時に、
 * ここへ安全なIPC呼び出しを追加していく。
 */
contextBridge.exposeInMainWorld('engineAgentApi', {
  appVersion: process.env.npm_package_version ?? 'dev',
  auth: {
    register: (email: string, password: string, displayName: string) =>
      ipcRenderer.invoke('auth:register', { email, password, displayName }),
    login: (email: string, password: string) =>
      ipcRenderer.invoke('auth:login', { email, password }),
    logout: () => ipcRenderer.invoke('auth:logout'),
  },
  projects: {
    list: () => ipcRenderer.invoke('project:list'),
    create: (name: string, engineType: string) =>
      ipcRenderer.invoke('project:create', { name, engineType }),
    remove: (projectId: number) => ipcRenderer.invoke('project:delete', { projectId }),
  },
});
