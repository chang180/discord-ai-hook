export type ArticleSource =
  | "openai"
  | "anthropic_news"
  | "anthropic_engineering";

export interface Article {
  url: string;
  title: string;
  source: ArticleSource;
  publishedAt: string | null;
  category: string | null;
}

export interface FilterResult {
  pass: boolean;
  reason: string | null;
}

export interface FormattedMessage {
  article: Article;
  content: string;
}

export interface SourcePreviewSlice {
  source: ArticleSource;
  label: string;
  wouldSend: FormattedMessage[];
  filtered: { article: Article; reason: string }[];
  truncated: boolean;
  passedCount: number;
}

export interface PreviewResult {
  wouldSend: FormattedMessage[];
  filtered: { article: Article; reason: string }[];
  truncated: boolean;
  bySource: SourcePreviewSlice[];
}

export interface WatcherResult extends PreviewResult {
  sent: FormattedMessage[];
  errors: string[];
}

export interface WatcherStatus {
  lastRunAt: string | null;
  lastRunError: string | null;
  totalArticles: number;
  sentCount: number;
  pendingCount: number;
}
