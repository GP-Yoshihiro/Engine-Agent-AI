import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { AppDatabase } from './db/Database';
import { AuthError, AuthService } from './auth/AuthService';
import { SessionStore } from './auth/SessionStore';
import { ProjectError, ProjectService } from './projects/ProjectService';
import { ChatError, ChatService } from './chat/ChatService';

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

interface ChatListArgs {
  projectId: number;
}

interface ChatSendArgs {
  projectId: number;
  content: string;
}

function toDomainErrorMessage(error: unknown, fallbackMessage: string): Error {
  if (error instanceof AuthError || error instanceof ProjectError || error instanceof ChatError) {
    return new Error(error.message);
  }
  return new Error(fallbackMessage);
}

function registerAuthHandlers(authService: AuthService, sessionStore: SessionStore): void {
  ipcMain.handle('auth:register', (_event, args: RegisterArgs) => {
    try {
      const user = authService.register(args.email, args.password, args.displayName);
      sessionStore.set(user);
      return user;
    } catch (error) {
      throw toDomainErrorMessage(error, '登録処理中にエラーが発生しました。');
    }
  });

  ipcMain.handle('auth:login', (_event, args: LoginArgs) => {
    try {
      const user = authService.login(args.email, args.password);
      sessionStore.set(user);
      return user;
    } catch (error) {
      throw toDomainErrorMessage(error, 'ログイン処理中にエラーが発生しました。');
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
      throw toDomainErrorMessage(error, 'プロジェクト作成中にエラーが発生しました。');
    }
  });

  ipcMain.handle('project:delete', (_event, args: DeleteProjectArgs) => {
    const user = sessionStore.requireCurrentUser();
    try {
      projectService.remove(user.id, args.projectId);
    } catch (error) {
      throw toDomainErrorMessage(error, 'プロジェクト削除中にエラーが発生しました。');
    }
  });
}

function registerChatHandlers(chatService: ChatService, sessionStore: SessionStore): void {
  ipcMain.handle('chat:list', (_event, args: ChatListArgs) => {
    const user = sessionStore.requireCurrentUser();
    try {
      return chatService.list(user.id, args.projectId);
    } catch (error) {
      throw toDomainErrorMessage(error, 'チャット履歴の取得中にエラーが発生しました。');
    }
  });

  ipcMain.handle('chat:send', (_event, args: ChatSendArgs) => {
    const user = sessionStore.requireCurrentUser();
    try {
      return chatService.sendMessage(user.id, args.projectId, args.content);
    } catch (error) {
      throw toDomainErrorMessage(error, 'メッセージ送信中にエラーが発生しました。');
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
  const chatService = new ChatService(database, projectService);

  registerAuthHandlers(authService, sessionStore);
  registerProjectHandlers(projectService, sessionStore);
  registerChatHandlers(chatService, sessionStore);

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
