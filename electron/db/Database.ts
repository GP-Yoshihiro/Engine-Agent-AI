import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { SCHEMA_SQL } from './schema';

/**
 * アプリのローカルSQLiteデータベース。
 * ネイティブビルドを避けるため、Node.js組み込みの node:sqlite を使用する。
 */
export class AppDatabase {
  private readonly connection: DatabaseSync;

  constructor(databaseFilePath: string) {
    fs.mkdirSync(path.dirname(databaseFilePath), { recursive: true });
    this.connection = new DatabaseSync(databaseFilePath);
    this.connection.exec('PRAGMA foreign_keys = ON;');
    this.connection.exec(SCHEMA_SQL);
    this.runAdditiveMigrations();
  }

  get raw(): DatabaseSync {
    return this.connection;
  }

  close(): void {
    this.connection.close();
  }

  /**
   * CREATE TABLE IF NOT EXISTS では既存テーブルへのカラム追加が反映されないため、
   * 既存DBに対する追加カラムのマイグレーションをここで個別に行う。
   */
  private runAdditiveMigrations(): void {
    this.addColumnIfMissing('projects', 'project_path', 'TEXT');
  }

  private addColumnIfMissing(table: string, column: string, definition: string): void {
    const columns = this.connection.prepare(`PRAGMA table_info(${table})`).all() as unknown as {
      name: string;
    }[];
    const exists = columns.some((c) => c.name === column);
    if (!exists) {
      this.connection.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
  }
}
