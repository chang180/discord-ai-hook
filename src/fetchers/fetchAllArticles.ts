import type { Article } from "../types.js";
import { fetchOpenAiArticles } from "./openaiRss.js";
import { fetchAnthropicArticles } from "./anthropicHtml.js";

export interface FetchAllOptions {
  userAgent: string;
  fetchImpl?: typeof fetch;
  openAiXml?: string;
  anthropicNewsHtml?: string;
  anthropicEngineeringHtml?: string;
}

export async function fetchAllArticles(
  options: FetchAllOptions,
): Promise<Article[]> {
  const [openai, anthropic] = await Promise.all([
    fetchOpenAiArticles({
      userAgent: options.userAgent,
      fetchImpl: options.fetchImpl,
      xml: options.openAiXml,
    }),
    fetchAnthropicArticles({
      userAgent: options.userAgent,
      fetchImpl: options.fetchImpl,
      newsHtml: options.anthropicNewsHtml,
      engineeringHtml: options.anthropicEngineeringHtml,
    }),
  ]);

  const byUrl = new Map<string, Article>();
  for (const a of [...openai, ...anthropic]) {
    if (!byUrl.has(a.url)) byUrl.set(a.url, a);
  }
  return [...byUrl.values()];
}
