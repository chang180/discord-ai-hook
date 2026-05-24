import { describe, it, expect } from "vitest";
import { processAllSources } from "../../src/sources/processAllSources.js";
import type { ContentSource } from "../../src/sources/types.js";
import type { Article, ArticleSource } from "../../src/types.js";
import { loadFixture } from "../helpers/loadFixture.js";
import { parseOpenAiRssXml } from "../../src/fetchers/openaiRss.js";
import { parseAnthropicEngineeringHtml } from "../../src/fetchers/anthropicHtml.js";

function makePassingArticle(source: ArticleSource, i: number): Article {
  return {
    url: `https://example.com/${source}/${i}`,
    title: `Agent Codex release ${i}`,
    source,
    publishedAt: new Date(2026, 4, 20 - i).toISOString(),
    category: null,
  };
}

describe("processAllSources", () => {
  it("applies per-source limit independently", async () => {
    const mockOpenAi: ContentSource = {
      id: "openai",
      label: "OpenAI",
      fetch: async () =>
        Array.from({ length: 10 }, (_, i) => makePassingArticle("openai", i)),
      evaluate: () => ({ pass: true, reason: null }),
      orderArticles: (a) => a,
    };

    const mockEng: ContentSource = {
      id: "anthropic_engineering",
      label: "Anthropic Engineering",
      fetch: async () =>
        Array.from({ length: 8 }, (_, i) =>
          makePassingArticle("anthropic_engineering", i),
        ),
      evaluate: () => ({ pass: true, reason: null }),
      orderArticles: (a) => a,
    };

    const result = await processAllSources({
      ctx: { userAgent: "test", perSourceLimit: 3 },
      sources: [mockOpenAi, mockEng],
    });

    expect(result.bySource).toHaveLength(2);
    expect(result.bySource[0]?.wouldSend).toHaveLength(3);
    expect(result.bySource[1]?.wouldSend).toHaveLength(3);
    expect(result.wouldSend).toHaveLength(6);
    expect(result.truncated).toBe(true);
  });

  it("processes fixture data per source", async () => {
    const openaiXml = loadFixture("openai-news.rss.xml");
    const engHtml = loadFixture("anthropic-engineering.html");
    const openai = await parseOpenAiRssXml(openaiXml);
    const eng = parseAnthropicEngineeringHtml(engHtml);

    expect(openai.length).toBeGreaterThan(0);
    expect(eng.length).toBeGreaterThan(0);

    const result = await processAllSources({
      ctx: {
        userAgent: "test",
        perSourceLimit: 3,
        fixtures: {
          openai: openaiXml,
          anthropic_news: loadFixture("anthropic-news.html"),
          anthropic_engineering: engHtml,
        },
      },
    });

    expect(result.bySource).toHaveLength(3);
    for (const slice of result.bySource) {
      expect(slice.wouldSend.length).toBeLessThanOrEqual(3);
    }
  });
});
