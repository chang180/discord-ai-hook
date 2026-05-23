import { describe, it, expect, vi } from "vitest";
import { runWatcher } from "../../src/pipeline/runWatcher.js";
import { loadConfig, resetConfigCache } from "../../src/config.js";
import { createTestRepo } from "../helpers/testDb.js";
import { loadFixture } from "../helpers/loadFixture.js";

describe("runWatcher integration", () => {
  it("returns preview messages without sending in dry run", async () => {
    resetConfigCache();
    process.env.DISCORD_WEBHOOK_URL = "";
    process.env.DRY_RUN = "true";
    process.env.MAX_NOTIFICATIONS_PER_RUN = "10";
    const config = loadConfig();
    const repo = createTestRepo();

    const fetchImpl = vi.fn();

    const result = await runWatcher(
      {
        config,
        repo,
        fetchImpl,
        openAiXml: loadFixture("openai-news.rss.xml"),
        anthropicNewsHtml: loadFixture("anthropic-news.html"),
        anthropicEngineeringHtml: loadFixture("anthropic-engineering.html"),
      },
      { dryRun: true, persist: false },
    );

    expect(result.wouldSend.length).toBeGreaterThan(0);
    expect(result.wouldSend[0]?.content).toContain("【");
    expect(result.sent).toHaveLength(0);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
