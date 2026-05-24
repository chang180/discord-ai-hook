import type { Article } from "../types.js";

/** YYYY-MM-DD in the given IANA time zone */
export function calendarDateInTimeZone(date: Date, timeZone: string): string {
  return date.toLocaleDateString("en-CA", { timeZone });
}

/** Inclusive calendar-day distance: `later` minus `earlier` (0 = same day). */
export function calendarDaysBetween(
  laterYmd: string,
  earlierYmd: string,
): number {
  const later = new Date(`${laterYmd}T12:00:00.000Z`);
  const earlier = new Date(`${earlierYmd}T12:00:00.000Z`);
  return Math.round((later.getTime() - earlier.getTime()) / 86_400_000);
}

/**
 * Whether the article's publish date falls in the lookback window.
 * Uses calendar days in `timeZone` (see `TZ`). **Excludes today** — suited for a
 * daily evening cron that digests the previous calendar day(s).
 *
 * - `lookbackDays === 1` → **yesterday only** (e.g. Taipei 5/24 20:00 run → 5/23 posts)
 * - `lookbackDays === 7` → yesterday through 7 calendar days ago (not today)
 * - `lookbackDays === 0` → disable date filter
 *
 * Missing `publishedAt` passes (e.g. Anthropic Engineering list without dates).
 */
export function isArticleWithinLookback(
  article: Article,
  lookbackDays: number,
  timeZone: string,
  now: Date = new Date(),
): boolean {
  if (lookbackDays === 0) return true;
  if (!article.publishedAt) return true;

  const publishedMs = Date.parse(article.publishedAt);
  if (Number.isNaN(publishedMs)) return false;

  const today = calendarDateInTimeZone(now, timeZone);
  const articleDay = calendarDateInTimeZone(new Date(publishedMs), timeZone);
  const ageDays = calendarDaysBetween(today, articleDay);

  return ageDays >= 1 && ageDays < 1 + lookbackDays;
}

export function getDateWindowFilterReason(
  article: Article,
  lookbackDays: number,
): string {
  if (lookbackDays === 0 || !article.publishedAt) {
    return "date:skipped";
  }
  const publishedMs = Date.parse(article.publishedAt);
  if (Number.isNaN(publishedMs)) return "date:invalid_published_at";
  return `date:outside_lookback_${lookbackDays}d`;
}

export function partitionByLookbackWindow(
  articles: Article[],
  lookbackDays: number,
  timeZone: string,
  now: Date = new Date(),
): {
  inWindow: Article[];
  outOfWindow: { article: Article; reason: string }[];
} {
  if (lookbackDays === 0) {
    return { inWindow: articles, outOfWindow: [] };
  }

  const inWindow: Article[] = [];
  const outOfWindow: { article: Article; reason: string }[] = [];

  for (const article of articles) {
    if (isArticleWithinLookback(article, lookbackDays, timeZone, now)) {
      inWindow.push(article);
    } else {
      outOfWindow.push({
        article,
        reason: getDateWindowFilterReason(article, lookbackDays),
      });
    }
  }

  return { inWindow, outOfWindow };
}
