import { parseAnthropicNewsHtml, NEWS_URL } from "../fetchers/anthropicHtml.js";
import type { ContentSource } from "./types.js";
import { defaultOrderByDate, evaluateAnthropicNews } from "./shared.js";

async function fetchNewsHtml(
  userAgent: string,
  fetchImpl: typeof fetch,
): Promise<string> {
  const res = await fetchImpl(NEWS_URL, {
    headers: { "User-Agent": userAgent },
  });
  if (!res.ok) {
    throw new Error(`Anthropic news fetch failed: ${res.status}`);
  }
  return res.text();
}

export const anthropicNewsSource: ContentSource = {
  id: "anthropic_news",
  label: "Anthropic News",
  async fetch(ctx) {
    const html =
      ctx.fixtures?.anthropic_news ??
      (await fetchNewsHtml(ctx.userAgent, ctx.fetchImpl ?? fetch));
    return parseAnthropicNewsHtml(html).map((a) => ({
      ...a,
      source: "anthropic_news" as const,
    }));
  },
  evaluate: evaluateAnthropicNews,
  orderArticles: defaultOrderByDate,
};
