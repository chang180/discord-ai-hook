import { describe, it, expect } from "vitest";
import { openDatabase } from "../../src/storage/db.js";
import { ArticlesRepo } from "../../src/storage/articlesRepo.js";
import type { Article } from "../../src/types.js";

describe("article retention", () => {
  it("deletes rows older than retention days", () => {
    const db = openDatabase(":memory:");
    const repo = new ArticlesRepo(db);

    const old: Article = {
      url: "https://example.com/old",
      title: "Old",
      source: "openai",
      publishedAt: null,
      category: null,
    };
    const recent: Article = {
      url: "https://example.com/new",
      title: "New",
      source: "openai",
      publishedAt: null,
      category: null,
    };

    repo.upsertArticle(old);
    repo.upsertArticle(recent);
    db.prepare(`UPDATE articles SET first_seen_at = @t WHERE url = @url`).run({
      url: old.url,
      t: "2020-01-01T00:00:00.000Z",
    });

    const deleted = repo.deleteArticlesOlderThanDays(30);
    expect(deleted).toBe(1);
    expect(repo.wasProcessed(old.url)).toBe(false);
    expect(repo.wasProcessed(recent.url)).toBe(false);
    const remaining = (
      db.prepare(`SELECT COUNT(*) as c FROM articles`).get() as { c: number }
    ).c;
    expect(remaining).toBe(1);
  });
});
