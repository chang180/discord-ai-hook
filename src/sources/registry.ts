import type { ArticleSource } from "../types.js";
import type { ContentSource } from "./types.js";
import { openaiSource } from "./openaiSource.js";
import { anthropicNewsSource } from "./anthropicNewsSource.js";
import { anthropicEngineeringSource } from "./anthropicEngineeringSource.js";

export const contentSources: ContentSource[] = [
  openaiSource,
  anthropicNewsSource,
  anthropicEngineeringSource,
];

export function getSourceById(id: ArticleSource): ContentSource {
  const source = contentSources.find((s) => s.id === id);
  if (!source) {
    throw new Error(`Unknown content source: ${id}`);
  }
  return source;
}
