import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

// Only this small interface is shared with D1. A batch is always atomic.
class Statement {
  constructor(
    readonly db: DatabaseSync,
    readonly sql: string,
    readonly params: SQLInputValue[] = [],
  ) {}

  bind(...params: SQLInputValue[]) {
    return new Statement(this.db, this.sql, params);
  }

  async first() {
    return this.db.prepare(this.sql).get(...this.params) ?? null;
  }

  execute() {
    const statement = this.db.prepare(this.sql);
    if (statement.columns().length) {
      return { results: statement.all(...this.params), meta: { changes: 0 } };
    }
    const result = statement.run(...this.params);
    return { results: [], meta: { changes: Number(result.changes) } };
  }

  async run() {
    return this.execute();
  }
}

export class SQLiteStorage {
  readonly database: DatabaseSync;

  constructor(filename: string) {
    mkdirSync(dirname(resolve(filename)), { recursive: true });
    this.database = new DatabaseSync(filename);
    try {
      this.database.exec('PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;');
      this.database.exec(`
        BEGIN IMMEDIATE;
        CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, payload TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1);
        CREATE TABLE IF NOT EXISTS ideas (id TEXT PRIMARY KEY, payload TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, date TEXT NOT NULL, title TEXT NOT NULL);
        COMMIT;
      `);
    } catch (error) {
      this.database.close();
      throw error;
    }
  }

  prepare(sql: string) {
    return new Statement(this.database, sql);
  }

  async batch(statements: Statement[]) {
    this.database.exec('BEGIN IMMEDIATE');
    try {
      const results = statements.map(statement => statement.execute());
      this.database.exec('COMMIT');
      return results;
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }
}

let db: SQLiteStorage | undefined;
export async function storage() {
  db ??= new SQLiteStorage(process.env.DATABASE_PATH || resolve('data/proyectos.sqlite'));
  return db;
}
