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

const PENDING_AGENT_REPLY = 'AIエージェントとの連携は現在準備中です。もうしばらくお待ちください。';

/**
 * プロジェクトごとのチャットメッセージ送受信・履歴保存を担うサービス。
 * AIエージェント（Claude Agent SDK）との連携が実装されるまでは、
 * ユーザーのメッセージを保存した上で固定の案内メッセージを返す。
 */
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

  sendMessage(userId: number, projectId: number, content: string): ChatMessage[] {
    this.projectService.get(userId, projectId);

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      throw new ChatError('メッセージを入力してください。');
    }

    const userMessage = this.insert(projectId, 'user', trimmedContent);
    const agentMessage = this.insert(projectId, 'agent', PENDING_AGENT_REPLY);

    return [userMessage, agentMessage];
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
