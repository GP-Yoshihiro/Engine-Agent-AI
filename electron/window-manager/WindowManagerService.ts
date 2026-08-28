import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export class WindowManagerError extends Error {}

export interface WindowRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function escapeForAppleScript(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * macOSの「システムイベント」（Accessibility権限が必要）経由で、
 * 外部アプリ（UE/Unity/Visual Studio Code等）を起動し、
 * そのフロントウィンドウをアプリ内パネルの位置・サイズに合わせる。
 * 真のウィンドウ埋め込みではなく、位置・サイズの追従による疑似アタッチ。
 */
export class WindowManagerService {
  guessProcessName(appPath: string): string {
    return path.basename(appPath, '.app');
  }

  async launchApp(appPath: string): Promise<void> {
    try {
      await execFileAsync('open', ['-a', appPath]);
    } catch (error) {
      throw new WindowManagerError(
        `アプリの起動に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async syncWindowPosition(processName: string, rect: WindowRect): Promise<void> {
    const safeName = escapeForAppleScript(processName);
    const script = [
      'tell application "System Events"',
      `  if not (exists process "${safeName}") then`,
      '    error "process not found"',
      '  end if',
      `  tell process "${safeName}"`,
      '    set frontmost to true',
      `    set position of window 1 to {${Math.round(rect.x)}, ${Math.round(rect.y)}}`,
      `    set size of window 1 to {${Math.round(rect.width)}, ${Math.round(rect.height)}}`,
      '  end tell',
      'end tell',
    ].join('\n');

    try {
      await execFileAsync('osascript', ['-e', script]);
    } catch {
      throw new WindowManagerError(
        `ウィンドウの位置合わせに失敗しました。「${processName}」が起動しているか、` +
          'システム設定 > プライバシーとセキュリティ > アクセシビリティ でこのアプリの操作が許可されているか確認してください。',
      );
    }
  }
}
