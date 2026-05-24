import type { Article, PreviewResult } from "../types.js";
import { evaluateArticle } from "../filters/evaluateArticle.js";
import { formatMessage } from "../discord/formatMessage.js";
import {
  buildPreviewSlice,
  processAllSources,
} from "../sources/processAllSources.js";
import type { SourceRunContext } from "../sources/types.js";

export { buildPreviewSlice, processAllSources };

export interface BuildPreviewOptions {
  articles: Article[];
  maxNotifications: number;
  skipUrls?: Set<string>;
}

/** @deprecated Use processAllSources for multi-source pipelines */
export function buildPreview(options: BuildPreviewOptions): PreviewResult {
  const slice = buildPreviewSlice({
    articles: options.articles,
    maxNotifications: options.maxNotifications,
    skipUrls: options.skipUrls,
    evaluate: evaluateArticle,
    format: formatMessage,
  });

  return {
    wouldSend: slice.wouldSend,
    filtered: slice.filtered,
    truncated: slice.truncated,
    bySource: [],
  };
}

export function buildPreviewFromContext(
  ctx: SourceRunContext,
  skipUrls?: Set<string>,
): Promise<PreviewResult> {
  return processAllSources({ ctx, skipUrls });
}
