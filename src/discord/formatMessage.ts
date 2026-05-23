import type { Article } from "../types.js";

const SOURCE_LABELS: Record<Article["source"], string> = {
  openai: "OpenAI",
  anthropic_news: "Anthropic News",
  anthropic_engineering: "Anthropic Engineering",
};

export const DISCORD_CONTENT_LIMIT = 2000;

export function getSourceLabel(source: Article["source"]): string {
  return SOURCE_LABELS[source];
}

export function formatMessage(article: Article): string {
  const label = getSourceLabel(article.source);
  const lines = [
    `【${label}】`,
    "",
    `標題：${article.title}`,
    "",
    `原文：`,
    article.url,
  ];
  return lines.join("\n");
}

export function isContentWithinLimit(content: string): boolean {
  return content.length <= DISCORD_CONTENT_LIMIT;
}
