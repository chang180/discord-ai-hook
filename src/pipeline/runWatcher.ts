import type { AppConfig } from "../config.js";
import { hasWebhook } from "../config.js";
import type { WatcherResult, PreviewResult } from "../types.js";
import { fetchAllArticles } from "../fetchers/fetchAllArticles.js";
import { buildPreview } from "./buildPreview.js";
import { sendWebhook } from "../discord/sendWebhook.js";
import { ArticlesRepo } from "../storage/articlesRepo.js";
import { evaluateArticle } from "../filters/evaluateArticle.js";
import { formatMessage } from "../discord/formatMessage.js";

export interface RunWatcherDeps {
  config: AppConfig;
  repo: ArticlesRepo;
  fetchImpl?: typeof fetch;
  openAiXml?: string;
  anthropicNewsHtml?: string;
  anthropicEngineeringHtml?: string;
}

export interface RunWatcherOptions {
  dryRun?: boolean;
  persist?: boolean;
}

export async function runWatcher(
  deps: RunWatcherDeps,
  options: RunWatcherOptions = {},
): Promise<WatcherResult> {
  const dryRun = options.dryRun ?? deps.config.DRY_RUN;
  const persist = options.persist ?? true;
  const errors: string[] = [];
  const sent: PreviewResult["wouldSend"] = [];

  let articles;
  try {
    articles = await fetchAllArticles({
      userAgent: deps.config.HTTP_USER_AGENT,
      fetchImpl: deps.fetchImpl,
      openAiXml: deps.openAiXml,
      anthropicNewsHtml: deps.anthropicNewsHtml,
      anthropicEngineeringHtml: deps.anthropicEngineeringHtml,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (persist) deps.repo.setLastRun(new Date().toISOString(), msg);
    throw err;
  }

  const skipUrls = new Set<string>();
  for (const article of articles) {
    if (persist) {
      deps.repo.upsertArticle(article);
      if (deps.repo.wasSent(article.url)) {
        skipUrls.add(article.url);
      }
    }
  }

  const preview = buildPreview({
    articles,
    maxNotifications: deps.config.MAX_NOTIFICATIONS_PER_RUN,
    skipUrls,
  });

  if (persist) {
    for (const { article, reason } of preview.filtered) {
      if (!deps.repo.wasProcessed(article.url)) {
        deps.repo.upsertArticle(article);
        deps.repo.markFiltered(article.url, reason);
      }
    }
  }

  const webhookUrl = deps.config.DISCORD_WEBHOOK_URL ?? "";
  const canSend = hasWebhook(deps.config) && !dryRun;

  for (const item of preview.wouldSend) {
    if (persist && deps.repo.wasSent(item.article.url)) continue;

    try {
      if (canSend) {
        await sendWebhook({
          webhookUrl,
          content: item.content,
          dryRun: false,
          fetchImpl: deps.fetchImpl,
        });
        if (persist) deps.repo.markSent(item.article.url);
        sent.push(item);
      } else if (dryRun) {
        // preview only
      } else if (!hasWebhook(deps.config)) {
        errors.push(`Skipped send (no webhook): ${item.article.title}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${item.article.title}: ${msg}`);
    }
  }

  if (persist) {
    deps.repo.setLastRun(
      new Date().toISOString(),
      errors.length > 0 ? errors.join("; ") : null,
    );
  }

  return {
    ...preview,
    sent,
    errors,
  };
}

export async function previewOnly(
  deps: RunWatcherDeps,
): Promise<PreviewResult> {
  const articles = await fetchAllArticles({
    userAgent: deps.config.HTTP_USER_AGENT,
    fetchImpl: deps.fetchImpl,
    openAiXml: deps.openAiXml,
    anthropicNewsHtml: deps.anthropicNewsHtml,
    anthropicEngineeringHtml: deps.anthropicEngineeringHtml,
  });

  return buildPreview({
    articles,
    maxNotifications: deps.config.MAX_NOTIFICATIONS_PER_RUN,
  });
}

export function formatArticleByUrl(
  articles: import("../types.js").Article[],
  url: string,
): string | null {
  const article = articles.find((a) => a.url === url);
  if (!article) return null;
  const result = evaluateArticle(article);
  if (!result.pass) return null;
  return formatMessage(article);
}
