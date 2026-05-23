import { config as loadDotenv } from "dotenv";
import { z } from "zod";

loadDotenv();

const envSchema = z.object({
  DISCORD_WEBHOOK_URL: z.string().default(""),
  CRON_SCHEDULE: z.string().default("0 20 * * *"),
  TZ: z.string().default("Asia/Taipei"),
  DRY_RUN: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  MAX_NOTIFICATIONS_PER_RUN: z.coerce.number().int().min(1).max(50).default(3),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().default("127.0.0.1"),
  ENABLE_TEST_UI: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  DATABASE_PATH: z.string().default("./data/watcher.db"),
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
  cached = parsed.data;
  return cached;
}

export function resetConfigCache(): void {
  cached = null;
}

export function hasWebhook(config: AppConfig): boolean {
  return Boolean(config.DISCORD_WEBHOOK_URL && config.DISCORD_WEBHOOK_URL.length > 0);
}
