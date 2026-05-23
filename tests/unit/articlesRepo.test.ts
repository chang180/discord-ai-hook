import { describe, it, expect } from "vitest";
import { createTestRepo } from "../helpers/testDb.js";
import type { Article } from "../../src/types.js";

const article: Article = {
  url: "https://example.com/a/1",
  title: "Test Agent API",
  source: "openai",
  publishedAt: null,
  category: "Product",
};

describe("ArticlesRepo", () => {
  it("upserts and tracks sent state", () => {
    const repo = createTestRepo();
    expect(repo.upsertArticle(article)).toBe(true);
    expect(repo.wasSent(article.url)).toBe(false);
    repo.markSent(article.url);
    expect(repo.wasSent(article.url)).toBe(true);
  });

  it("marks filtered articles", () => {
    const repo = createTestRepo();
    repo.upsertArticle(article);
    repo.markFiltered(article.url, "exclude:test");
    expect(repo.wasProcessed(article.url)).toBe(true);
  });
});
