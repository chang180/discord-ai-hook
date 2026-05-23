import { describe, it, expect } from "vitest";
import { parseOpenAiRssXml } from "../../src/fetchers/openaiRss.js";
import { loadFixture } from "../helpers/loadFixture.js";

describe("parseOpenAiRssXml", () => {
  it("parses articles from fixture", async () => {
    const xml = loadFixture("openai-news.rss.xml");
    const articles = await parseOpenAiRssXml(xml);
    expect(articles.length).toBe(3);
    expect(articles[0]?.title).toBe("Work with Codex from anywhere");
    expect(articles[0]?.source).toBe("openai");
    expect(articles[0]?.category).toBe("Product");
  });
});
