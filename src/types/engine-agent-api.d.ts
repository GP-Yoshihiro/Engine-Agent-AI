import type { EngineType } from '../constants/engineTypes';

export {};

export interface AuthenticatedUser {
  id: number;
  email: string;
  displayName: string;
}

export interface Project {
  id: number;
  userId: number;
  name: string;
  engineType: EngineType;
  projectPath: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthApi {
  register: (email: string, password: string, displayName: string) => Promise<AuthenticatedUser>;
  login: (email: string, password: string) => Promise<AuthenticatedUser>;
  logout: () => Promise<void>;
}

interface ProjectsApi {
  list: () => Promise<Project[]>;
  create: (name: string, engineType: EngineType, projectPath: string) => Promise<Project>;
  remove: (projectId: number) => Promise<void>;
  selectFolder: () => Promise<string | null>;
}

export type ChatRole = 'user' | 'agent';

export interface ChatMessage {
  id: number;
  projectId: number;
  role: ChatRole;
  content: string;
  createdAt: string;
}

interface ChatApi {
  list: (projectId: number) => Promise<ChatMessage[]>;
  send: (projectId: number, content: string) => Promise<ChatMessage[]>;
}

export interface WorkHistoryEntry {
  id: number;
  projectId: number;
  toolName: string;
  summary: string;
  createdAt: string;
}

interface WorkHistoryApi {
  list: (projectId: number) => Promise<WorkHistoryEntry[]>;
}

export interface WindowRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WindowManagerApi {
  selectApp: () => Promise<string | null>;
  launch: (appPath: string) => Promise<{ processName: string }>;
  syncPosition: (processName: string, rect: WindowRect) => Promise<void>;
}

declare global {
  interface Window {
    engineAgentApi: {
      appVersion: string;
      auth: AuthApi;
      projects: ProjectsApi;
      chat: ChatApi;
      workHistory: WorkHistoryApi;
      windowManager: WindowManagerApi;
    };
  }
}
