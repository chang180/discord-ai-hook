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
  it("parses engineering links", () => {
    const html = loadFixture("anthropic-engineering.html");
    const articles = parseAnthropicEngineeringHtml(html);
    expect(articles.length).toBeGreaterThanOrEqual(2);
    expect(articles.some((a) => a.url.includes("harness-design"))).toBe(true);
    expect(articles[0]?.source).toBe("anthropic_engineering");
  });
});
