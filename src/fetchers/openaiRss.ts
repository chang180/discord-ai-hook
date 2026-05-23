import Parser from "rss-parser";
import type { Article } from "../types.js";

const OPENAI_RSS_URL = "https://openai.com/news/rss.xml";

export interface OpenAiRssOptions {
  feedUrl?: string;
  xml?: string;
  userAgent: string;
  fetchImpl?: typeof fetch;
}

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  categories?: string[];
  category?: string;
};

export async function parseOpenAiRssXml(xml: string): Promise<Article[]> {
  const parser = new Parser<Record<string, unknown>, RssItem>({
    customFields: { item: ["category"] },
  });
  const feed = await parser.parseString(xml);
  return feed.items
    .map((item) => normalizeOpenAiItem(item))
    .filter((a): a is Article => a !== null);
}

function normalizeOpenAiItem(item: RssItem): Article | null {
  const url = item.link?.trim();
  const title = item.title?.trim();
  if (!url || !title) return null;

  const category =
    item.categories?.[0] ?? (typeof item.category === "string" ? item.category : null);

  return {
    url,
    title,
    source: "openai",
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : null,
    category: category ?? null,
  };
}

export async function fetchOpenAiArticles(
  options: OpenAiRssOptions,
): Promise<Article[]> {
  if (options.xml) {
    return await parseOpenAiRssXml(options.xml);
  }

  const feedUrl = options.feedUrl ?? OPENAI_RSS_URL;
  const fetchImpl = options.fetchImpl ?? fetch;
  const res = await fetchImpl(feedUrl, {
    headers: { "User-Agent": options.userAgent },
  });
  if (!res.ok) {
    throw new Error(`OpenAI RSS fetch failed: ${res.status}`);
  }
  const xml = await res.text();
  return await parseOpenAiRssXml(xml);
}
