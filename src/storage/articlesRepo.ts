import type Database from "better-sqlite3";
import type { Article } from "../types.js";
import type { WatcherStatus } from "../types.js";

export interface StoredArticle extends Article {
  firstSeenAt: string;
  sentAt: string | null;
  filteredOut: boolean;
  filterReason: string | null;
}

export class ArticlesRepo {
  constructor(private readonly db: Database.Database) {}

  upsertArticle(article: Article): boolean {
    const now = new Date().toISOString();
    const result = this.db
      .prepare(
        `INSERT OR IGNORE INTO articles (url, source, title, published_at, category, first_seen_at, filtered_out)
         VALUES (@url, @source, @title, @publishedAt, @category, @firstSeenAt, 0)`,
      )
      .run({
        url: article.url,
        source: article.source,
        title: article.title,
        publishedAt: article.publishedAt,
        category: article.category,
        firstSeenAt: now,
      });
    return result.changes > 0;
  }

  markFiltered(url: string, reason: string): void {
    this.db
      .prepare(
        `UPDATE articles SET filtered_out = 1, filter_reason = @reason WHERE url = @url`,
      )
      .run({ url, reason });
  }

  markSent(url: string): void {
    this.db
      .prepare(`UPDATE articles SET sent_at = @sentAt WHERE url = @url`)
      .run({ url, sentAt: new Date().toISOString() });
  }

  wasSent(url: string): boolean {
    const row = this.db
      .prepare(`SELECT sent_at FROM articles WHERE url = @url`)
      .get({ url }) as { sent_at: string | null } | undefined;
    return Boolean(row?.sent_at);
  }

  wasProcessed(url: string): boolean {
    const row = this.db
      .prepare(
        `SELECT sent_at, filtered_out FROM articles WHERE url = @url`,
      )
      .get({ url }) as { sent_at: string | null; filtered_out: number } | undefined;
    if (!row) return false;
    return Boolean(row.sent_at) || row.filtered_out === 1;
  }

  getStatus(): WatcherStatus {
    const total = (
      this.db.prepare(`SELECT COUNT(*) as c FROM articles`).get() as { c: number }
    ).c;
    const sentCount = (
      this.db
        .prepare(`SELECT COUNT(*) as c FROM articles WHERE sent_at IS NOT NULL`)
        .get() as { c: number }
    ).c;
    const pendingCount = (
      this.db
        .prepare(
          `SELECT COUNT(*) as c FROM articles WHERE sent_at IS NULL AND filtered_out = 0`,
        )
        .get() as { c: number }
    ).c;

    const lastRunAt =
      (this.getMeta("last_run_at") as string | null) ?? null;
    const lastRunError =
      (this.getMeta("last_run_error") as string | null) ?? null;

    return {
      lastRunAt,
      lastRunError,
      totalArticles: total,
      sentCount,
      pendingCount,
    };
  }

  setLastRun(at: string, error: string | null): void {
    this.setMeta("last_run_at", at);
    this.setMeta("last_run_error", error ?? "");
  }

  /** Remove articles first seen before the retention window (frees SQLite space). */
  deleteArticlesOlderThanDays(days: number): number {
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - days);
    const cutoffIso = cutoff.toISOString();
    const result = this.db
      .prepare(`DELETE FROM articles WHERE first_seen_at < @cutoff`)
      .run({ cutoff: cutoffIso });
    return result.changes;
  }

  /** Daily maintenance: prune old rows and compact the database file. */
  pruneOldArticles(retentionDays: number): { deleted: number } {
    const deleted = this.deleteArticlesOlderThanDays(retentionDays);
    if (deleted > 0) {
      this.db.exec("VACUUM");
    }
    return { deleted };
  }

  private getMeta(key: string): string | null {
    const row = this.db
      .prepare(`SELECT value FROM watcher_meta WHERE key = @key`)
      .get({ key }) as { value: string } | undefined;
    return row?.value ?? null;
  }

  private setMeta(key: string, value: string): void {
    this.db
      .prepare(
        `INSERT INTO watcher_meta (key, value) VALUES (@key, @value)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      )
      .run({ key, value });
  }
}
