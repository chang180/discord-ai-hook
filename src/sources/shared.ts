import type { Article, FilterResult } from "../types.js";
import { formatMessage as defaultFormatMessage } from "../discord/formatMessage.js";
import type { ContentSource } from "./types.js";
import {
  matchesExcludeKeyword,
  hasEngineeringKeyword,
} from "../filters/keywordExclude.js";
import { matchesIncludeKeyword } from "../filters/keywordInclude.js";

export function applySharedExcludes(article: Article): FilterResult | null {
  const searchText = [article.title, article.category ?? ""].join(" ");
  const excludeReason = matchesExcludeKeyword(searchText);
  if (excludeReason) {
    return { pass: false, reason: excludeReason };
  }
  return null;
}

export function requireIncludeKeywords(article: Article): FilterResult {
  if (matchesIncludeKeyword(article.title)) {
    return { pass: true, reason: null };
  }
  return { pass: false, reason: "include:no_matching_keyword" };
}

export function evaluateOpenAi(article: Article): FilterResult {
  const excluded = applySharedExcludes(article);
  if (excluded) return excluded;

  if (
    article.category?.toLowerCase() === "company" &&
    !hasEngineeringKeyword(article.title)
  ) {
    return { pass: false, reason: "openai:company_without_engineering_keyword" };
  }

  return requireIncludeKeywords(article);
}

export function evaluateAnthropicNews(article: Article): FilterResult {
  const excluded = applySharedExcludes(article);
  if (excluded) return excluded;
  return requireIncludeKeywords(article);
}

export function evaluateAnthropicEngineering(article: Article): FilterResult {
  const excluded = applySharedExcludes(article);
  if (excluded) return excluded;
  return { pass: true, reason: null };
}

export function defaultOrderByDate(articles: Article[]): Article[] {
  return [...articles].sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });
}

export function resolveFormatMessage(
  source: ContentSource,
  article: Article,
): string {
  return source.formatMessage?.(article) ?? defaultFormatMessage(article);
}
