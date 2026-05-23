const INCLUDE_KEYWORDS = [
  "api",
  "sdk",
  "agent",
  "claude code",
  "codex",
  "tool",
  "model",
  "gpt",
  "release",
  "harness",
  "mcp",
  "eval",
];

export function matchesIncludeKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return INCLUDE_KEYWORDS.some((kw) => lower.includes(kw));
}

export function getIncludeKeywords(): readonly string[] {
  return INCLUDE_KEYWORDS;
}
