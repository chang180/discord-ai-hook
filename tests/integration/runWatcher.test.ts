import { describe, it, expect } from "vitest";
import { runWatcher } from "../../src/pipeline/runWatcher.js";
import { loadConfig, resetConfigCache } from "../../src/config.js";
import { createTestRepo } from "../helpers/testDb.js";
import { loadFixture } from "../helpers/loadFixture.js";

describe("runWatcher integration", () => {
  it("returns per-source preview without sending in dry run", async () => {
    resetConfigCache();
    process.env.DISCORD_WEBHOOK_URL = "";
    process.env.DRY_RUN = "true";
    process.env.MAX_NOTIFICATIONS_PER_SOURCE = "3";
    const config = loadConfig();
    const repo = createTestRepo();

    const result = await runWatcher(
      {
        config,
        repo,
        fixtures: {
          openai: loadFixture("openai-news.rss.xml"),
          anthropic_news: loadFixture("anthropic-news.html"),
          anthropic_engineering: loadFixture("anthropic-engineering.html"),
        },
      },
      { dryRun: true, persist: false },
    );

    expect(result.bySource).toHaveLength(3);
    expect(result.wouldSend.length).toBeGreaterThan(0);
    expect(result.sent).toHaveLength(0);
  });
});
