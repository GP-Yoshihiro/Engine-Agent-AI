import type { AppDatabase } from '../db/Database';
import type { ProjectService } from '../projects/ProjectService';

export interface WorkHistoryEntry {
  id: number;
  projectId: number;
  toolName: string;
  summary: string;
  createdAt: string;
}

interface WorkHistoryRow {
  id: number;
  project_id: number;
  tool_name: string;
  summary: string;
  created_at: string;
}

function toWorkHistoryEntry(row: WorkHistoryRow): WorkHistoryEntry {
  return {
    id: row.id,
    projectId: row.project_id,
    toolName: row.tool_name,
    summary: row.summary,
    createdAt: row.created_at,
  };
}

/** AIエージェントがプロジェクトに対して行った操作（ファイル編集・コマンド実行等）の履歴を記録・取得する。 */
export class WorkHistoryService {
  constructor(
    private readonly db: AppDatabase,
    private readonly projectService: ProjectService,
  ) {}

  list(userId: number, projectId: number): WorkHistoryEntry[] {
    this.projectService.get(userId, projectId);

    const rows = this.db.raw
      .prepare('SELECT * FROM work_history WHERE project_id = ? ORDER BY id ASC')
      .all(projectId) as unknown as WorkHistoryRow[];
    return rows.map(toWorkHistoryEntry);
  }

  /** 呼び出し元で既にプロジェクトの所有権を確認済みであることを前提とする。 */
  record(projectId: number, toolName: string, summary: string): void {
    this.db.raw
      .prepare('INSERT INTO work_history (project_id, tool_name, summary) VALUES (?, ?, ?)')
      .run(projectId, toolName, summary);
  }
}
