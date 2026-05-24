import type { Article } from "../types.js";
import type { FilterResult } from "../types.js";
import { getSourceById } from "../sources/registry.js";

export function evaluateArticle(article: Article): FilterResult {
  return getSourceById(article.source).evaluate(article);
}
