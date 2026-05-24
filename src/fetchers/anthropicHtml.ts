import * as cheerio from "cheerio";
import type { Article, ArticleSource } from "../types.js";

const ANTHROPIC_BASE = "https://www.anthropic.com";
export const NEWS_URL = `${ANTHROPIC_BASE}/news`;
export const ENGINEERING_URL = `${ANTHROPIC_BASE}/engineering`;

export interface AnthropicHtmlOptions {
  userAgent: string;
  fetchImpl?: typeof fetch;
  newsHtml?: string;
  engineeringHtml?: string;
}

function absoluteUrl(href: string): string {
  if (href.startsWith("http")) return href;
  return `${ANTHROPIC_BASE}${href.startsWith("/") ? href : `/${href}`}`;
}

function pushNewsArticle(
  articles: Article[],
  seen: Set<string>,
  url: string,
  title: string,
  publishedAt: string | null,
  category: string | null,
): void {
  if (!title || seen.has(url)) return;
  seen.add(url);
  articles.push({
    url,
    title,
    source: "anthropic_news",
    publishedAt,
    category,
  });
}

export function parseAnthropicNewsHtml(html: string): Article[] {
  const $ = cheerio.load(html);
  const articles: Article[] = [];
  const seen = new Set<string>();

  $('a[href^="/news/"]').each((_, el) => {
    const anchor = $(el);
    const href = anchor.attr("href");
    if (!href) return;

    const url = absoluteUrl(href);
    const title =
      anchor.find("h2, h3, h4, .headline-4, .headline-6").first().text().trim() ||
      anchor.find(".FeaturedGrid-module-scss-module__W1FydW__title").text().trim() ||
      anchor.find(".FeaturedGrid-module-scss-module__W1FydW__featuredTitle").text().trim() ||
      "";
    const dateText = anchor.find("time").first().text().trim();
    const category =
      anchor.find(".FeaturedGrid-module-scss-module__W1FydW__meta .caption").first().text().trim() ||
      anchor.find(".caption.bold").first().text().trim() ||
      "";

    if (title) {
      pushNewsArticle(
        articles,
        seen,
        url,
        title,
        dateText ? parseAnthropicDate(dateText) : null,
        category || null,
      );
    }
  });

  $("a.PublicationList-module-scss-module__KxYrHG__listItem").each((_, el) => {
    const anchor = $(el);
    const href = anchor.attr("href");
    if (!href || !href.startsWith("/news/")) return;

    const url = absoluteUrl(href);
    const title = anchor
      .find(".PublicationList-module-scss-module__KxYrHG__title")
      .text()
      .trim();
    const dateText = anchor.find("time").first().text().trim();
    const category = anchor
      .find(".PublicationList-module-scss-module__KxYrHG__subject")
      .text()
      .trim();

    pushNewsArticle(
      articles,
      seen,
      url,
      title,
      dateText ? parseAnthropicDate(dateText) : null,
      category || null,
    );
  });

  return articles;
}

export function parseAnthropicEngineeringHtml(html: string): Article[] {
  const $ = cheerio.load(html);
  const articles: Article[] = [];
  const seen = new Set<string>();

  $('a[href^="/engineering/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href === "/engineering") return;

    const url = absoluteUrl(href);
    if (seen.has(url)) return;
    seen.add(url);

    let title =
      $(el).find("h2, h3, h4").first().text().trim() ||
      $(el).text().trim().split("\n")[0]?.trim() ||
      "";

    if (!title || title.length < 5) {
      const slug = href.replace("/engineering/", "").replace(/-/g, " ");
      title = slug.charAt(0).toUpperCase() + slug.slice(1);
    }

    const dateText = $(el).find('[class*="__date"]').first().text().trim();
    const publishedAt = dateText ? parseAnthropicDate(dateText) : null;

    articles.push({
      url,
      title,
      source: "anthropic_engineering",
      publishedAt,
      category: "Engineering",
    });
  });

  return articles;
}

function parseAnthropicDate(text: string): string | null {
  const parsed = Date.parse(text);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString();
}

async function fetchHtml(
  url: string,
  userAgent: string,
  fetchImpl: typeof fetch,
): Promise<string> {
  const res = await fetchImpl(url, {
    headers: { "User-Agent": userAgent },
  });
  if (!res.ok) {
    throw new Error(`Anthropic fetch failed (${url}): ${res.status}`);
  }
  return res.text();
}

export async function fetchAnthropicArticles(
  options: AnthropicHtmlOptions,
): Promise<Article[]> {
  const fetchImpl = options.fetchImpl ?? fetch;

  const newsHtml =
    options.newsHtml ??
    (await fetchHtml(NEWS_URL, options.userAgent, fetchImpl));
  const engineeringHtml =
    options.engineeringHtml ??
    (await fetchHtml(ENGINEERING_URL, options.userAgent, fetchImpl));

  const news = parseAnthropicNewsHtml(newsHtml);
  const engineering = parseAnthropicEngineeringHtml(engineeringHtml);

  const byUrl = new Map<string, Article>();
  for (const a of [...news, ...engineering]) {
    if (!byUrl.has(a.url)) byUrl.set(a.url, a);
  }
  return [...byUrl.values()];
}

export function parseAnthropicHtml(
  html: string,
  source: ArticleSource,
): Article[] {
  if (source === "anthropic_news") return parseAnthropicNewsHtml(html);
  return parseAnthropicEngineeringHtml(html);
}
