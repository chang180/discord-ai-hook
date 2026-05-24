import type {
  Article,
  FilterResult,
  FormattedMessage,
  PreviewResult,
  SourcePreviewSlice,
} from "../types.js";
import type { ContentSource, SourceRunContext } from "./types.js";
import { contentSources } from "./registry.js";
import { resolveFormatMessage } from "./shared.js";

export interface ProcessAllSourcesOptions {
  ctx: SourceRunContext;
  skipUrls?: Set<string>;
  sources?: ContentSource[];
}

export interface BuildPreviewSliceOptions {
  articles: Article[];
  maxNotifications: number;
  skipUrls?: Set<string>;
  evaluate: (article: Article) => FilterResult;
  format: (article: Article) => string;
}

export function buildPreviewSlice(
  options: BuildPreviewSliceOptions,
): Omit<SourcePreviewSlice, "source" | "label"> {
  const { articles, maxNotifications, skipUrls = new Set(), evaluate, format } =
    options;

  const wouldSend: FormattedMessage[] = [];
  const filtered: { article: Article; reason: string }[] = [];

  for (const article of articles) {
    if (skipUrls.has(article.url)) continue;

    const result = evaluate(article);
    if (!result.pass) {
      filtered.push({ article, reason: result.reason ?? "filtered" });
      continue;
    }

    if (wouldSend.length < maxNotifications) {
      wouldSend.push({ article, content: format(article) });
    }
  }

  const passedCount = articles.filter((a) => {
    if (skipUrls.has(a.url)) return false;
    return evaluate(a).pass;
  }).length;

  return {
    wouldSend,
    filtered,
    truncated: passedCount > wouldSend.length,
    passedCount,
  };
}

export async function processAllSources(
  options: ProcessAllSourcesOptions,
): Promise<PreviewResult> {
  const { ctx, skipUrls = new Set(), sources = contentSources } = options;
  const bySource: SourcePreviewSlice[] = [];

  for (const source of sources) {
    const raw = await source.fetch(ctx);
    const ordered = source.orderArticles(raw);
    const limit = source.getMaxPerRun?.(ctx) ?? ctx.perSourceLimit;

    const slice = buildPreviewSlice({
      articles: ordered,
      maxNotifications: limit,
      skipUrls,
      evaluate: (a) => source.evaluate(a),
      format: (a) => resolveFormatMessage(source, a),
    });

    bySource.push({
      source: source.id,
      label: source.label,
      ...slice,
    });
  }

  const wouldSend = bySource.flatMap((s) => s.wouldSend);
  const filtered = bySource.flatMap((s) => s.filtered);

  return {
    wouldSend,
    filtered,
    truncated: bySource.some((s) => s.truncated),
    bySource,
  };
}

export async function fetchAllFromSources(
  ctx: SourceRunContext,
  sources = contentSources,
): Promise<Article[]> {
  const all: Article[] = [];
  for (const source of sources) {
    const articles = await source.fetch(ctx);
    all.push(...articles);
  }
  return all;
}
