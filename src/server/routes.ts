import { Router, type Request, type Response } from "express";
import type { AppConfig } from "../config.js";
import { hasWebhook } from "../config.js";
import type { ArticlesRepo } from "../storage/articlesRepo.js";
import { previewOnly, runWatcher } from "../pipeline/runWatcher.js";
import { sendTestWebhook, sendWebhook } from "../discord/sendWebhook.js";
import { formatMessage } from "../discord/formatMessage.js";
import { evaluateArticle } from "../filters/evaluateArticle.js";
import { fetchAllArticles } from "../fetchers/fetchAllArticles.js";
export function createRoutes(config: AppConfig, repo: ArticlesRepo): Router {
  const router = Router();

  router.get("/status", (_req: Request, res: Response) => {
    res.json(repo.getStatus());
  });

  router.get("/preview", async (_req: Request, res: Response) => {
    try {
      const result = await previewOnly({ config, repo });
      res.json(result);
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });

  router.post("/run", async (req: Request, res: Response) => {
    const dryRun =
      req.body?.dryRun === true ||
      req.query.dryRun === "true" ||
      (req.body?.dryRun !== false && config.DRY_RUN);

    try {
      const result = await runWatcher(
        { config, repo },
        { dryRun, persist: !dryRun },
      );
      res.json({ ...result, dryRun });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });

  router.post("/send", async (req: Request, res: Response) => {
    if (!hasWebhook(config)) {
      res.status(400).json({ error: "DISCORD_WEBHOOK_URL is not configured" });
      return;
    }

    const { content, url } = req.body as { content?: string; url?: string };

    try {
      let messageContent = content;

      if (!messageContent && url) {
        const articles = await fetchAllArticles({
          userAgent: config.HTTP_USER_AGENT,
        });
        const article = articles.find((a) => a.url === url);
        if (!article) {
          res.status(404).json({ error: "Article not found" });
          return;
        }
        const filter = evaluateArticle(article);
        if (!filter.pass) {
          res.status(400).json({ error: filter.reason });
          return;
        }
        messageContent = formatMessage(article);
      }

      if (!messageContent) {
        res.status(400).json({ error: "Provide content or url" });
        return;
      }

      await sendWebhook({
        webhookUrl: config.DISCORD_WEBHOOK_URL!,
        content: messageContent,
        dryRun: false,
      });

      if (url) repo.markSent(url);
      res.json({ ok: true, content: messageContent });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });

  router.post("/test-webhook", async (req: Request, res: Response) => {
    if (!hasWebhook(config)) {
      res.status(400).json({ error: "DISCORD_WEBHOOK_URL is not configured" });
      return;
    }

    const dryRun = req.body?.dryRun === true;

    try {
      await sendTestWebhook(config.DISCORD_WEBHOOK_URL!, dryRun);
      res.json({ ok: true, dryRun });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });

  return router;
}
