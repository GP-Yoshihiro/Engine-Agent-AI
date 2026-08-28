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
  create: (name: string, engineType: EngineType) => Promise<Project>;
  remove: (projectId: number) => Promise<void>;
}

declare global {
  interface Window {
    engineAgentApi: {
      appVersion: string;
      auth: AuthApi;
      projects: ProjectsApi;
    };
  }
}
