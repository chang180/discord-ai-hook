import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { createApp } from "../../src/server/app.js";
import { loadConfig, resetConfigCache } from "../../src/config.js";
import { createTestRepo } from "../helpers/testDb.js";

const mockPreview = {
  wouldSend: [
    {
      article: {
        url: "https://openai.com/index/codex",
        title: "Work with Codex",
        source: "openai",
        publishedAt: null,
        category: "Product",
      },
      content: "【OpenAI】\n\n標題：Work with Codex\n\n原文：\nhttps://openai.com/index/codex",
    },
  ],
  filtered: [],
  truncated: false,
  bySource: [
    {
      source: "openai",
      label: "OpenAI",
      wouldSend: [
        {
          article: {
            url: "https://openai.com/index/codex",
            title: "Work with Codex",
            source: "openai",
            publishedAt: null,
            category: "Product",
          },
          content: "【OpenAI】\n\n標題：Work with Codex\n\n原文：\nhttps://openai.com/index/codex",
        },
      ],
      filtered: [],
      truncated: false,
      passedCount: 1,
    },
    {
      source: "anthropic_news",
      label: "Anthropic News",
      wouldSend: [],
      filtered: [{ article: { url: "https://x", title: "KPMG", source: "anthropic_news", publishedAt: null, category: null }, reason: "exclude:kpmg" }],
      truncated: false,
      passedCount: 0,
    },
    {
      source: "anthropic_engineering",
      label: "Anthropic Engineering",
      wouldSend: [
        {
          article: {
            url: "https://www.anthropic.com/engineering/harness",
            title: "Harness design",
            source: "anthropic_engineering",
            publishedAt: null,
            category: null,
          },
          content: "【Anthropic Engineering】\n\n標題：Harness\n\n原文：\nhttps://...",
        },
      ],
      filtered: [],
      truncated: false,
      passedCount: 1,
    },
  ],
};

vi.mock("../../src/pipeline/runWatcher.js", () => ({
  previewOnly: vi.fn(async () => mockPreview),
  runWatcher: vi.fn(async () => ({ ...mockPreview, sent: [], errors: [] })),
}));

describe("API routes", () => {
  beforeEach(() => {
    resetConfigCache();
    process.env.DISCORD_WEBHOOK_URL = "";
    process.env.ENABLE_TEST_UI = "true";
    process.env.MAX_NOTIFICATIONS_PER_SOURCE = "3";
  });

  it("GET /api/preview returns bySource with content", async () => {
    const config = loadConfig();
    const app = createApp(config, createTestRepo());
    const res = await request(app).get("/api/preview");
    expect(res.status).toBe(200);
    expect(res.body.bySource).toHaveLength(3);
    expect(res.body.bySource[0].wouldSend[0].content).toContain("標題：");
  });

  it("GET /api/status returns counts", async () => {
    const config = loadConfig();
    const app = createApp(config, createTestRepo());
    const res = await request(app).get("/api/status");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalArticles");
  });
});
