import type { Article } from "../types.js";
import type { FilterResult } from "../types.js";
import { matchesIncludeKeyword } from "./keywordInclude.js";
import {
  matchesExcludeKeyword,
  hasEngineeringKeyword,
} from "./keywordExclude.js";

export function evaluateArticle(article: Article): FilterResult {
  const searchText = [article.title, article.category ?? ""].join(" ");

  const excludeReason = matchesExcludeKeyword(searchText);
  if (excludeReason) {
    return { pass: false, reason: excludeReason };
  }

  if (article.source === "openai") {
    if (
      article.category?.toLowerCase() === "company" &&
      !hasEngineeringKeyword(article.title)
    ) {
      return { pass: false, reason: "openai:company_without_engineering_keyword" };
    }
  }

  if (article.source === "anthropic_engineering") {
    return { pass: true, reason: null };
  }

  if (matchesIncludeKeyword(article.title)) {
    return { pass: true, reason: null };
  }

  return { pass: false, reason: "include:no_matching_keyword" };
}
