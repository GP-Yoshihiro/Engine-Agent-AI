import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { AppDatabase } from './db/Database';
import { AuthError, AuthService } from './auth/AuthService';

const isDev = process.env.NODE_ENV === 'development';

interface RegisterArgs {
  email: string;
  password: string;
  displayName: string;
}

interface LoginArgs {
  email: string;
  password: string;
}

function registerAuthHandlers(authService: AuthService): void {
  ipcMain.handle('auth:register', (_event, args: RegisterArgs) => {
    try {
      return authService.register(args.email, args.password, args.displayName);
    } catch (error) {
      throw new Error(error instanceof AuthError ? error.message : '登録処理中にエラーが発生しました。');
    }
  });

  ipcMain.handle('auth:login', (_event, args: LoginArgs) => {
    try {
      return authService.login(args.email, args.password);
    } catch (error) {
      throw new Error(error instanceof AuthError ? error.message : 'ログイン処理中にエラーが発生しました。');
    }
  });
}

function createMainWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  const database = new AppDatabase(path.join(app.getPath('userData'), 'engine-agent-ai.db'));
  const authService = new AuthService(database);
  registerAuthHandlers(authService);

  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
