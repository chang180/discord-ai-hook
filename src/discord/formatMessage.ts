import type { Article } from "../types.js";

const SOURCE_LABELS: Record<Article["source"], string> = {
  openai: "OpenAI",
  anthropic_news: "Anthropic News",
  anthropic_engineering: "Anthropic Engineering",
};

export const DISCORD_CONTENT_LIMIT = 2000;

/** 與上一則訊息（含 embed）拉開距離 */
const LEADING_BLANK_LINES = 2;
/** 結尾小字尾註（Discord subtext，不會像粗線卡在 embed 旁） */
export const MESSAGE_FOOTER = "-# · · · · · · · · · · · · · · · · · · · ·";

export function getSourceLabel(source: Article["source"]): string {
  return SOURCE_LABELS[source];
}

export function formatMessage(article: Article): string {
  const label = getSourceLabel(article.source);
  const lines: string[] = [];

  for (let i = 0; i < LEADING_BLANK_LINES; i++) lines.push("");

  lines.push(
    `【${label}】`,
    "",
    `標題：${article.title}`,
    "",
    `原文：`,
    `<${article.url}>`,
    "",
    MESSAGE_FOOTER,
  );

  return lines.join("\n");
}

export function isContentWithinLimit(content: string): boolean {
  return content.length <= DISCORD_CONTENT_LIMIT;
}
