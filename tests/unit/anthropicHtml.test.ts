import { describe, it, expect } from "vitest";
import {
  parseAnthropicNewsHtml,
  parseAnthropicEngineeringHtml,
} from "../../src/fetchers/anthropicHtml.js";
import { loadFixture } from "../helpers/loadFixture.js";

describe("parseAnthropicNewsHtml", () => {
  it("parses news list items", () => {
    const html = loadFixture("anthropic-news.html");
    const articles = parseAnthropicNewsHtml(html);
    expect(articles).toHaveLength(2);
    expect(articles[0]?.url).toContain("/news/finance-agents");
    expect(articles[0]?.title).toBe("Agents for financial services");
  });
});

describe("parseAnthropicEngineeringHtml", () => {
  it("parses engineering links with dates", () => {
    const html = loadFixture("anthropic-engineering.html");
    const articles = parseAnthropicEngineeringHtml(html);
    expect(articles.length).toBeGreaterThanOrEqual(2);
    expect(articles[0]?.source).toBe("anthropic_engineering");

    const harness = articles.find((a) => a.url.includes("harness-design"));
    expect(harness).toBeDefined();
    expect(harness?.publishedAt).not.toBeNull();
    expect(harness?.publishedAt).toMatch(/^2026-03-2[34]T/);

    const autoMode = articles.find((a) => a.url.includes("claude-code-auto-mode"));
    expect(autoMode?.publishedAt).not.toBeNull();
    expect(autoMode?.publishedAt).toMatch(/^2026-03-2[45]T/);
  });

  it("falls back to null publishedAt when date is missing", () => {
    const html = loadFixture("anthropic-engineering.html");
    const articles = parseAnthropicEngineeringHtml(html);
    const noDate = articles.find((a) => a.url.includes("no-date-article"));
    expect(noDate).toBeDefined();
    expect(noDate?.publishedAt).toBeNull();
  });
});
