import { describe, it, expect } from "vitest";
import { formatMessage, DISCORD_CONTENT_LIMIT } from "../../src/discord/formatMessage.js";
import type { Article } from "../../src/types.js";

const sample: Article = {
  url: "https://www.anthropic.com/engineering/harness-design",
  title: "Harness design for long-running application development",
  source: "anthropic_engineering",
  publishedAt: null,
  category: "Engineering",
};

describe("formatMessage", () => {
  it("formats Discord content with label, title, and url", () => {
    const content = formatMessage(sample);
    expect(content).toContain("【Anthropic Engineering】");
    expect(content).toContain("標題：Harness design for long-running application development");
    expect(content).toContain("https://www.anthropic.com/engineering/harness-design");
    expect(content.length).toBeLessThanOrEqual(DISCORD_CONTENT_LIMIT);
  });

  it("matches golden snapshot shape", () => {
    expect(formatMessage(sample)).toMatchInlineSnapshot(`
      "【Anthropic Engineering】

      標題：Harness design for long-running application development

      原文：
      https://www.anthropic.com/engineering/harness-design"
    `);
  });
});
