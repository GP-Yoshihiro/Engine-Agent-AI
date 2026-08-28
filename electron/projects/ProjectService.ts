import type { AppDatabase } from '../db/Database';

export const ENGINE_TYPES = ['unreal-engine', 'unity'] as const;
export type EngineType = (typeof ENGINE_TYPES)[number];

const MAX_PROJECTS_PER_USER = 20;

export class ProjectError extends Error {}

export interface Project {
  id: number;
  userId: number;
  name: string;
  engineType: EngineType;
  createdAt: string;
  updatedAt: string;
}

interface ProjectRow {
  id: number;
  user_id: number;
  name: string;
  engine_type: string;
  created_at: string;
  updated_at: string;
}

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    engineType: row.engine_type as EngineType,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isEngineType(value: string): value is EngineType {
  return (ENGINE_TYPES as readonly string[]).includes(value);
}

/** プロジェクトの作成・一覧・削除を担うサービス。1アカウントあたり最大20件まで保持できる。 */
export class ProjectService {
  constructor(private readonly db: AppDatabase) {}

  list(userId: number): Project[] {
    const rows = this.db.raw
      .prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC')
      .all(userId) as unknown as ProjectRow[];
    return rows.map(toProject);
  }

  create(userId: number, name: string, engineType: string): Project {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new ProjectError('プロジェクト名を入力してください。');
    }
    if (!isEngineType(engineType)) {
      throw new ProjectError('使用するエンジンを選択してください。');
    }

    const { count } = this.db.raw
      .prepare('SELECT COUNT(*) as count FROM projects WHERE user_id = ?')
      .get(userId) as unknown as { count: number };
    if (count >= MAX_PROJECTS_PER_USER) {
      throw new ProjectError(
        `保存できるプロジェクトは1アカウントにつき最大${MAX_PROJECTS_PER_USER}個までです。既存のプロジェクトを削除してください。`,
      );
    }

    const result = this.db.raw
      .prepare('INSERT INTO projects (user_id, name, engine_type) VALUES (?, ?, ?)')
      .run(userId, trimmedName, engineType);

    const created = this.db.raw
      .prepare('SELECT * FROM projects WHERE id = ?')
      .get(Number(result.lastInsertRowid)) as unknown as ProjectRow;

    return toProject(created);
  }

  remove(userId: number, projectId: number): void {
    const result = this.db.raw
      .prepare('DELETE FROM projects WHERE id = ? AND user_id = ?')
      .run(projectId, userId);
    if (result.changes === 0) {
      throw new ProjectError('プロジェクトが見つかりません。');
    }
  }
}
