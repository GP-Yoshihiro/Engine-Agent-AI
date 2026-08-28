import { contextBridge, ipcRenderer } from 'electron';

/**
 * Renderer（React側）へ公開するAPIのブリッジ。
 * ウィンドウ管理の機能実装時に、ここへ安全なIPC呼び出しを追加していく。
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
    create: (name: string, engineType: string, projectPath: string) =>
      ipcRenderer.invoke('project:create', { name, engineType, projectPath }),
    remove: (projectId: number) => ipcRenderer.invoke('project:delete', { projectId }),
    selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  },
  chat: {
    list: (projectId: number) => ipcRenderer.invoke('chat:list', { projectId }),
    send: (projectId: number, content: string) =>
      ipcRenderer.invoke('chat:send', { projectId, content }),
  },
  workHistory: {
    list: (projectId: number) => ipcRenderer.invoke('work-history:list', { projectId }),
  },
  windowManager: {
    selectApp: () => ipcRenderer.invoke('dialog:selectApp'),
    launch: (appPath: string) => ipcRenderer.invoke('window-manager:launch', { appPath }),
    syncPosition: (
      processName: string,
      rect: { x: number; y: number; width: number; height: number },
    ) => ipcRenderer.invoke('window-manager:sync', { processName, rect }),
  },
});
