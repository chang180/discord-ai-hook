import { describe, it, expect } from "vitest";
import { evaluateArticle } from "../../src/filters/evaluateArticle.js";
import type { Article } from "../../src/types.js";

describe("evaluateArticle", () => {
  it("passes engineering articles broadly", () => {
    const article: Article = {
      url: "https://example.com/e/1",
      title: "Harness design for long-running apps",
      source: "anthropic_engineering",
      publishedAt: null,
      category: null,
    };
    expect(evaluateArticle(article).pass).toBe(true);
  });

  it("passes news with include keyword", () => {
    const article: Article = {
      url: "https://example.com/n/1",
      title: "Agents for financial services",
      source: "anthropic_news",
      publishedAt: null,
      category: "Announcements",
    };
    expect(evaluateArticle(article).pass).toBe(true);
  });

  it("blocks partnership news", () => {
    const article: Article = {
      url: "https://example.com/n/2",
      title: "KPMG integrates Claude",
      source: "anthropic_news",
      publishedAt: null,
      category: null,
    };
    const result = evaluateArticle(article);
    expect(result.pass).toBe(false);
    expect(result.reason).toContain("kpmg");
  });

  it("blocks OpenAI Company without engineering keyword", () => {
    const article: Article = {
      url: "https://openai.com/index/dell",
      title: "OpenAI and Dell partner",
      source: "openai",
      publishedAt: null,
      category: "Company",
    };
    expect(evaluateArticle(article).pass).toBe(false);
  });

  it("passes OpenAI Product with Codex", () => {
    const article: Article = {
      url: "https://openai.com/index/codex",
      title: "Work with Codex from anywhere",
      source: "openai",
      publishedAt: null,
      category: "Product",
    };
    expect(evaluateArticle(article).pass).toBe(true);
  });
});
