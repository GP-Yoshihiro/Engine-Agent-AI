import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { AppDatabase } from './db/Database';
import { AuthError, AuthService } from './auth/AuthService';
import { SessionStore } from './auth/SessionStore';
import { ProjectError, ProjectService } from './projects/ProjectService';

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

interface CreateProjectArgs {
  name: string;
  engineType: string;
}

interface DeleteProjectArgs {
  projectId: number;
}

function registerAuthHandlers(authService: AuthService, sessionStore: SessionStore): void {
  ipcMain.handle('auth:register', (_event, args: RegisterArgs) => {
    try {
      const user = authService.register(args.email, args.password, args.displayName);
      sessionStore.set(user);
      return user;
    } catch (error) {
      throw new Error(error instanceof AuthError ? error.message : '登録処理中にエラーが発生しました。');
    }
  });

  ipcMain.handle('auth:login', (_event, args: LoginArgs) => {
    try {
      const user = authService.login(args.email, args.password);
      sessionStore.set(user);
      return user;
    } catch (error) {
      throw new Error(error instanceof AuthError ? error.message : 'ログイン処理中にエラーが発生しました。');
    }
  });

  ipcMain.handle('auth:logout', () => {
    sessionStore.set(null);
  });
}

function registerProjectHandlers(projectService: ProjectService, sessionStore: SessionStore): void {
  ipcMain.handle('project:list', () => {
    const user = sessionStore.requireCurrentUser();
    return projectService.list(user.id);
  });

  ipcMain.handle('project:create', (_event, args: CreateProjectArgs) => {
    const user = sessionStore.requireCurrentUser();
    try {
      return projectService.create(user.id, args.name, args.engineType);
    } catch (error) {
      throw new Error(error instanceof ProjectError ? error.message : 'プロジェクト作成中にエラーが発生しました。');
    }
  });

  ipcMain.handle('project:delete', (_event, args: DeleteProjectArgs) => {
    const user = sessionStore.requireCurrentUser();
    try {
      projectService.remove(user.id, args.projectId);
    } catch (error) {
      throw new Error(error instanceof ProjectError ? error.message : 'プロジェクト削除中にエラーが発生しました。');
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
  const sessionStore = new SessionStore();
  const authService = new AuthService(database);
  const projectService = new ProjectService(database);

  registerAuthHandlers(authService, sessionStore);
  registerProjectHandlers(projectService, sessionStore);

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
