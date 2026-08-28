export {};

declare global {
  interface Window {
    engineAgentApi: {
      appVersion: string;
    };
  }
}
