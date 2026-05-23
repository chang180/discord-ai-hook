const EXCLUDE_KEYWORDS = [
  "partnership",
  "partners",
  "acquires",
  "acquisition",
  "kpmg",
  "pwc",
  "gates foundation",
  "investment",
  "enterprise ai services",
  "glasswing",
];

const ENGINEERING_KEYWORDS = [
  "api",
  "sdk",
  "agent",
  "codex",
  "tool",
  "model",
  "gpt",
  "release",
  "harness",
  "mcp",
  "eval",
  "claude code",
];

export function matchesExcludeKeyword(text: string): string | null {
  const lower = text.toLowerCase();
  for (const kw of EXCLUDE_KEYWORDS) {
    if (lower.includes(kw)) return `exclude:${kw}`;
  }
  return null;
}

export function getExcludeKeywords(): readonly string[] {
  return EXCLUDE_KEYWORDS;
}

export function hasEngineeringKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return ENGINEERING_KEYWORDS.some((kw) => lower.includes(kw));
}
