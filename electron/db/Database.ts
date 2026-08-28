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
  }

  get raw(): DatabaseSync {
    return this.connection;
  }

  close(): void {
    this.connection.close();
  }
}
