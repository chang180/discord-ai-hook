import type { Article, ArticleSource, FilterResult } from "../types.js";

export interface SourceRunContext {
  userAgent: string;
  fetchImpl?: typeof fetch;
  fixtures?: Partial<Record<ArticleSource, string>>;
  perSourceLimit: number;
  /** 0 = 不限制；N = TZ 內「昨天起」連續 N 個日曆日（不含今天） */
  articleLookbackDays: number;
  timeZone: string;
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
