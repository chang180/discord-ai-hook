import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../../src/server/app.js";
import { loadConfig, resetConfigCache } from "../../src/config.js";
import { createTestRepo } from "../helpers/testDb.js";
import { loadFixture } from "../helpers/loadFixture.js";
import { vi } from "vitest";

vi.mock("../../src/fetchers/fetchAllArticles.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/fetchers/fetchAllArticles.js")>();
  return {
    ...actual,
    fetchAllArticles: vi.fn(async () => {
      const { parseOpenAiRssXml } = await import("../../src/fetchers/openaiRss.js");
      const { parseAnthropicNewsHtml, parseAnthropicEngineeringHtml } =
        await import("../../src/fetchers/anthropicHtml.js");
      const openai = await parseOpenAiRssXml(loadFixture("openai-news.rss.xml"));
      const news = parseAnthropicNewsHtml(loadFixture("anthropic-news.html"));
      const eng = parseAnthropicEngineeringHtml(
        loadFixture("anthropic-engineering.html"),
      );
      return [...openai, ...news, ...eng];
    }),
  };
});

describe("API routes", () => {
  beforeEach(() => {
    resetConfigCache();
    process.env.DISCORD_WEBHOOK_URL = "";
    process.env.ENABLE_TEST_UI = "true";
  });

  it("GET /api/preview returns wouldSend with content", async () => {
    const config = loadConfig();
    const app = createApp(config, createTestRepo());
    const res = await request(app).get("/api/preview");
    expect(res.status).toBe(200);
    expect(res.body.wouldSend).toBeDefined();
    expect(res.body.wouldSend.length).toBeGreaterThan(0);
    expect(res.body.wouldSend[0].content).toContain("標題：");
  });

  it("GET /api/status returns counts", async () => {
    const config = loadConfig();
    const app = createApp(config, createTestRepo());
    const res = await request(app).get("/api/status");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalArticles");
  });
});
