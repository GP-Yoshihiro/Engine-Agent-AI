import type { AppDatabase } from '../db/Database';
import type { ProjectService } from '../projects/ProjectService';

export class ChatError extends Error {}

export type ChatRole = 'user' | 'agent';

export interface ChatMessage {
  id: number;
  projectId: number;
  role: ChatRole;
  content: string;
  createdAt: string;
}

interface ChatMessageRow {
  id: number;
  project_id: number;
  role: string;
  content: string;
  created_at: string;
}

function toChatMessage(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    projectId: row.project_id,
    role: row.role as ChatRole,
    content: row.content,
    createdAt: row.created_at,
  };
}

/** プロジェクトごとのチャットメッセージの永続化を担うサービス。実際のAIエージェント呼び出しはMain側で行う。 */
export class ChatService {
  constructor(
    private readonly db: AppDatabase,
    private readonly projectService: ProjectService,
  ) {}

  list(userId: number, projectId: number): ChatMessage[] {
    this.projectService.get(userId, projectId);

    const rows = this.db.raw
      .prepare('SELECT * FROM chat_messages WHERE project_id = ? ORDER BY id ASC')
      .all(projectId) as unknown as ChatMessageRow[];
    return rows.map(toChatMessage);
  }

  /** ユーザーのメッセージを保存する。所有権のないプロジェクトIDが渡された場合は例外を投げる。 */
  saveUserMessage(userId: number, projectId: number, content: string): ChatMessage {
    this.projectService.get(userId, projectId);

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      throw new ChatError('メッセージを入力してください。');
    }

    return this.insert(projectId, 'user', trimmedContent);
  }

  /** AIエージェントの返答を保存する。呼び出し元で既にプロジェクトの所有権を確認済みであることを前提とする。 */
  saveAgentMessage(projectId: number, content: string): ChatMessage {
    return this.insert(projectId, 'agent', content);
  }

  private insert(projectId: number, role: ChatRole, content: string): ChatMessage {
    const result = this.db.raw
      .prepare('INSERT INTO chat_messages (project_id, role, content) VALUES (?, ?, ?)')
      .run(projectId, role, content);

    const created = this.db.raw
      .prepare('SELECT * FROM chat_messages WHERE id = ?')
      .get(Number(result.lastInsertRowid)) as unknown as ChatMessageRow;

    return toChatMessage(created);
  }
}
