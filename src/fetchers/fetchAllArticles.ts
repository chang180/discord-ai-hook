import type { Article, ArticleSource } from "../types.js";
import {
  fetchAllFromSources,
  processAllSources,
} from "../sources/processAllSources.js";
import type { SourceRunContext } from "../sources/types.js";

export interface FetchAllOptions {
  userAgent: string;
  fetchImpl?: typeof fetch;
  openAiXml?: string;
  anthropicNewsHtml?: string;
  anthropicEngineeringHtml?: string;
  perSourceLimit?: number;
  articleLookbackDays?: number;
  timeZone?: string;
}

function toSourceContext(options: FetchAllOptions): SourceRunContext {
  const fixtures: Partial<Record<ArticleSource, string>> = {};
  if (options.openAiXml) fixtures.openai = options.openAiXml;
  if (options.anthropicNewsHtml) fixtures.anthropic_news = options.anthropicNewsHtml;
  if (options.anthropicEngineeringHtml) {
    fixtures.anthropic_engineering = options.anthropicEngineeringHtml;
  }

  return {
    userAgent: options.userAgent,
    fetchImpl: options.fetchImpl,
    fixtures: Object.keys(fixtures).length > 0 ? fixtures : undefined,
    perSourceLimit: options.perSourceLimit ?? 3,
    articleLookbackDays: options.articleLookbackDays ?? 0,
    timeZone: options.timeZone ?? "UTC",
  };
}

export async function fetchAllArticles(
  options: FetchAllOptions,
): Promise<Article[]> {
  return fetchAllFromSources(toSourceContext(options));
}

export async function fetchAndPreviewAll(
  options: FetchAllOptions,
  skipUrls?: Set<string>,
) {
  return processAllSources({
    ctx: toSourceContext(options),
    skipUrls,
  });
}
