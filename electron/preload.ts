import { contextBridge, ipcRenderer } from 'electron';

interface ToolApprovalRequest {
  requestId: string;
  toolName: string;
  input: Record<string, unknown>;
  description?: string;
}

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
  agent: {
    onApprovalRequest: (callback: (request: ToolApprovalRequest) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, request: ToolApprovalRequest) =>
        callback(request);
      ipcRenderer.on('agent:approval-request', listener);
      return () => ipcRenderer.removeListener('agent:approval-request', listener);
    },
    respondApproval: (requestId: string, approved: boolean) =>
      ipcRenderer.invoke('agent:approval-response', { requestId, approved }),
  },
});
