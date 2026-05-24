import cron from "node-cron";
import { loadConfig, getPerSourceLimit } from "./config.js";
import { contentSources } from "./sources/registry.js";
import { openDatabase } from "./storage/db.js";
import { ArticlesRepo } from "./storage/articlesRepo.js";
import { createApp } from "./server/app.js";
import { runWatcher } from "./pipeline/runWatcher.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const db = openDatabase(config.DATABASE_PATH);
  const repo = new ArticlesRepo(db);

  if (config.ENABLE_TEST_UI) {
    const app = createApp(config, repo);
    app.listen(config.PORT, config.HOST, () => {
      console.log(
        `Test UI: http://${config.HOST}:${config.PORT}/`,
      );
    });
  }

  const scheduleJob = async (): Promise<void> => {
    console.log(`[watcher] Running scheduled job at ${new Date().toISOString()}`);
    try {
      const { deleted } = repo.pruneOldArticles(config.ARTICLE_RETENTION_DAYS);
      if (deleted > 0) {
        console.log(
          `[watcher] Pruned ${deleted} article(s) older than ${config.ARTICLE_RETENTION_DAYS} days`,
        );
      }

      const result = await runWatcher({ config, repo }, { dryRun: config.DRY_RUN });
      console.log(
        `[watcher] Done. wouldSend=${result.wouldSend.length} sent=${result.sent.length} errors=${result.errors.length}`,
      );
    } catch (err) {
      console.error("[watcher] Job failed:", err);
    }
  };

  if (!cron.validate(config.CRON_SCHEDULE)) {
    throw new Error(`Invalid CRON_SCHEDULE: ${config.CRON_SCHEDULE}`);
  }

  cron.schedule(config.CRON_SCHEDULE, scheduleJob, {
    timezone: config.TZ,
  });

  const perSource = getPerSourceLimit(config);
  console.log(
    `Watcher scheduled: "${config.CRON_SCHEDULE}" (${config.TZ}), ${perSource}/source × ${contentSources.length} sources (max ${perSource * contentSources.length}/run), lookback ${config.ARTICLE_LOOKBACK_DAYS} day(s)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
