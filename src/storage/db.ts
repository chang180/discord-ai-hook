import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export function openDatabase(path: string): Database.Database {
  if (path !== ":memory:") {
    mkdirSync(dirname(path), { recursive: true });
  }
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  migrate(db);
  return db;
}

function migrate(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      url TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      title TEXT NOT NULL,
      published_at TEXT,
      category TEXT,
      first_seen_at TEXT NOT NULL,
      sent_at TEXT,
      filtered_out INTEGER NOT NULL DEFAULT 0,
      filter_reason TEXT
    );

    CREATE TABLE IF NOT EXISTS watcher_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}
