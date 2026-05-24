import type { AppConfig } from "../config.js";
import { hasWebhook, buildSourceRunContext } from "../config.js";
import type { WatcherResult, PreviewResult, ArticleSource } from "../types.js";
import { processAllSources, fetchAllFromSources } from "../sources/processAllSources.js";
import type { SourceRunContext } from "../sources/types.js";
import { sendWebhook } from "../discord/sendWebhook.js";
import { ArticlesRepo } from "../storage/articlesRepo.js";
import { getSourceById } from "../sources/registry.js";
import { resolveFormatMessage } from "../sources/shared.js";
import type { Article } from "../types.js";

export interface RunWatcherDeps {
  config: AppConfig;
  repo: ArticlesRepo;
  fetchImpl?: typeof fetch;
  fixtures?: Partial<Record<ArticleSource, string>>;
  /** @deprecated use fixtures */
  openAiXml?: string;
  anthropicNewsHtml?: string;
  anthropicEngineeringHtml?: string;
}

export interface RunWatcherOptions {
  dryRun?: boolean;
  persist?: boolean;
}

function buildSourceContext(deps: RunWatcherDeps): SourceRunContext {
  const fixtures: Partial<Record<ArticleSource, string>> = {
    ...deps.fixtures,
  };
  if (deps.openAiXml) fixtures.openai = deps.openAiXml;
  if (deps.anthropicNewsHtml) fixtures.anthropic_news = deps.anthropicNewsHtml;
  if (deps.anthropicEngineeringHtml) {
    fixtures.anthropic_engineering = deps.anthropicEngineeringHtml;
  }

  return buildSourceRunContext(deps.config, {
    fetchImpl: deps.fetchImpl,
    fixtures: Object.keys(fixtures).length > 0 ? fixtures : undefined,
  });
}

export async function runWatcher(
  deps: RunWatcherDeps,
  options: RunWatcherOptions = {},
): Promise<WatcherResult> {
  const dryRun = options.dryRun ?? deps.config.DRY_RUN;
  const persist = options.persist ?? true;
  const errors: string[] = [];
  const sent: PreviewResult["wouldSend"] = [];
  const ctx = buildSourceContext(deps);

  let articles: Article[];
  try {
    articles = await fetchAllFromSources(ctx);
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

  const preview = await processAllSources({ ctx, skipUrls });

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
      } else if (!hasWebhook(deps.config) && !dryRun) {
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

export async function previewOnly(deps: RunWatcherDeps): Promise<PreviewResult> {
  return processAllSources({ ctx: buildSourceContext(deps) });
}

export function formatArticleByUrl(
  articles: Article[],
  url: string,
): string | null {
  const article = articles.find((a) => a.url === url);
  if (!article) return null;
  const source = getSourceById(article.source);
  const result = source.evaluate(article);
  if (!result.pass) return null;
  return resolveFormatMessage(source, article);
}
