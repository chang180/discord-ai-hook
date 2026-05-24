import { fetchOpenAiArticles } from "../fetchers/openaiRss.js";
import type { ContentSource } from "./types.js";
import { defaultOrderByDate, evaluateOpenAi } from "./shared.js";

export const openaiSource: ContentSource = {
  id: "openai",
  label: "OpenAI",
  async fetch(ctx) {
    const articles = await fetchOpenAiArticles({
      userAgent: ctx.userAgent,
      fetchImpl: ctx.fetchImpl,
      xml: ctx.fixtures?.openai,
    });
    return articles.map((a) => ({ ...a, source: "openai" as const }));
  },
  evaluate: evaluateOpenAi,
  orderArticles: defaultOrderByDate,
};
