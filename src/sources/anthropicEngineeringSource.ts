import {
  parseAnthropicEngineeringHtml,
  ENGINEERING_URL,
} from "../fetchers/anthropicHtml.js";
import type { ContentSource } from "./types.js";
import { evaluateAnthropicEngineering } from "./shared.js";

async function fetchEngineeringHtml(
  userAgent: string,
  fetchImpl: typeof fetch,
): Promise<string> {
  const res = await fetchImpl(ENGINEERING_URL, {
    headers: { "User-Agent": userAgent },
  });
  if (!res.ok) {
    throw new Error(`Anthropic engineering fetch failed: ${res.status}`);
  }
  return res.text();
}

export const anthropicEngineeringSource: ContentSource = {
  id: "anthropic_engineering",
  label: "Anthropic Engineering",
  async fetch(ctx) {
    const html =
      ctx.fixtures?.anthropic_engineering ??
      (await fetchEngineeringHtml(ctx.userAgent, ctx.fetchImpl ?? fetch));
    return parseAnthropicEngineeringHtml(html).map((a) => ({
      ...a,
      source: "anthropic_engineering" as const,
    }));
  },
  evaluate: evaluateAnthropicEngineering,
  orderArticles: (articles) => articles,
};
