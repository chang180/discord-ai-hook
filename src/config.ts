import { config as loadDotenv } from "dotenv";
import { z } from "zod";
import type { SourceRunContext } from "./sources/types.js";

loadDotenv();

const envSchema = z.object({
  DISCORD_WEBHOOK_URL: z.string().default(""),
  CRON_SCHEDULE: z.string().default("0 20 * * *"),
  TZ: z.string().default("Asia/Taipei"),
  DRY_RUN: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  MAX_NOTIFICATIONS_PER_SOURCE: z.coerce.number().int().min(1).max(50).default(3),
  MAX_NOTIFICATIONS_PER_RUN: z.coerce.number().int().min(1).max(50).optional(),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().default("127.0.0.1"),
  ENABLE_TEST_UI: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  DATABASE_PATH: z.string().default("./data/watcher.db"),
  ARTICLE_RETENTION_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  /** 0 = 不限制；N = 只處理 TZ「今天之前」連續 N 個日曆日（1=僅昨天） */
  ARTICLE_LOOKBACK_DAYS: z.coerce.number().int().min(0).max(365).default(1),
  HTTP_USER_AGENT: z
    .string()
    .default("Mozilla/5.0 (compatible; DiscordAILabsWatcher/1.0)"),
});

export type AppConfig = z.infer<typeof envSchema>;

let cached: AppConfig | null = null;

export function loadConfig(): AppConfig {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Invalid environment: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")}`,
    );
  }
  const data = parsed.data;
  if (
    data.MAX_NOTIFICATIONS_PER_RUN !== undefined &&
    process.env.MAX_NOTIFICATIONS_PER_SOURCE === undefined
  ) {
    data.MAX_NOTIFICATIONS_PER_SOURCE = data.MAX_NOTIFICATIONS_PER_RUN;
  }
  cached = data;
  return cached;
}

export function getPerSourceLimit(config: AppConfig): number {
  return config.MAX_NOTIFICATIONS_PER_SOURCE;
}

export function resetConfigCache(): void {
  cached = null;
}

export function hasWebhook(config: AppConfig): boolean {
  return Boolean(config.DISCORD_WEBHOOK_URL && config.DISCORD_WEBHOOK_URL.length > 0);
}

export function buildSourceRunContext(
  config: AppConfig,
  partial: Partial<
    Pick<SourceRunContext, "fetchImpl" | "fixtures" | "perSourceLimit">
  > = {},
): SourceRunContext {
  return {
    userAgent: config.HTTP_USER_AGENT,
    perSourceLimit: partial.perSourceLimit ?? getPerSourceLimit(config),
    articleLookbackDays: config.ARTICLE_LOOKBACK_DAYS,
    timeZone: config.TZ,
    fetchImpl: partial.fetchImpl,
    fixtures: partial.fixtures,
  };
}
