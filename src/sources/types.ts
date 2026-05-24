import type { Article, ArticleSource, FilterResult } from "../types.js";

export interface SourceRunContext {
  userAgent: string;
  fetchImpl?: typeof fetch;
  fixtures?: Partial<Record<ArticleSource, string>>;
  perSourceLimit: number;
}

export interface ContentSource {
  readonly id: ArticleSource;
  readonly label: string;
  fetch(ctx: SourceRunContext): Promise<Article[]>;
  evaluate(article: Article): FilterResult;
  orderArticles(articles: Article[]): Article[];
  getMaxPerRun?(ctx: SourceRunContext): number;
  formatMessage?(article: Article): string;
}
