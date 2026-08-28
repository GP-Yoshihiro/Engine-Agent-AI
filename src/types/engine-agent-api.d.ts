export {};

export interface AuthenticatedUser {
  id: number;
  email: string;
  displayName: string;
}

interface AuthApi {
  register: (email: string, password: string, displayName: string) => Promise<AuthenticatedUser>;
  login: (email: string, password: string) => Promise<AuthenticatedUser>;
}

declare global {
  interface Window {
    engineAgentApi: {
      appVersion: string;
      auth: AuthApi;
    };
  }
}
