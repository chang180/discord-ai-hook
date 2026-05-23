import type { Article, PreviewResult, FormattedMessage } from "../types.js";
import { evaluateArticle } from "../filters/evaluateArticle.js";
import { formatMessage } from "../discord/formatMessage.js";

export interface BuildPreviewOptions {
  articles: Article[];
  maxNotifications: number;
  skipUrls?: Set<string>;
}

export function buildPreview(options: BuildPreviewOptions): PreviewResult {
  const { articles, maxNotifications, skipUrls = new Set() } = options;

  const wouldSend: FormattedMessage[] = [];
  const filtered: { article: Article; reason: string }[] = [];

  for (const article of articles) {
    if (skipUrls.has(article.url)) continue;

    const result = evaluateArticle(article);
    if (!result.pass) {
      filtered.push({ article, reason: result.reason ?? "filtered" });
      continue;
    }

    if (wouldSend.length < maxNotifications) {
      wouldSend.push({
        article,
        content: formatMessage(article),
      });
    }
  }

  const passedCount = articles.filter((a) => {
    if (skipUrls.has(a.url)) return false;
    return evaluateArticle(a).pass;
  }).length;

  return {
    wouldSend,
    filtered,
    truncated: passedCount > wouldSend.length,
  };
}
