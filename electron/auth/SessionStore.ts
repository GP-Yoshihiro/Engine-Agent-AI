import type { AuthenticatedUser } from './AuthService';

/**
 * 現在ログイン中のユーザーをMainプロセス側で保持する。
 * プロジェクト等のIPCハンドラは、Rendererから渡されたuserIdを信用せず、
 * ここに保持された認証済みユーザーのIDのみを使ってデータへアクセスする。
 */
export class SessionStore {
  private currentUser: AuthenticatedUser | null = null;

  set(user: AuthenticatedUser | null): void {
    this.currentUser = user;
  }

  get(): AuthenticatedUser | null {
    return this.currentUser;
  }

  requireCurrentUser(): AuthenticatedUser {
    if (!this.currentUser) {
      throw new Error('ログインしていません。');
    }
    return this.currentUser;
  }
}
