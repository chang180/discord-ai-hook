# 架構

## 流程

1. `node-cron` 依 `CRON_SCHEDULE` 觸發（預設每日 20:00）
2. `pruneOldArticles` 刪除超過 `ARTICLE_RETENTION_DAYS` 的 SQLite 紀錄並 `VACUUM`
3. `processAllSources` 依 [`contentSources` registry](../src/sources/registry.ts) 對每來源：`fetch` → `order` → `evaluate` → 各取 N 則
4. SQLite 記錄已見文章，跳過已發送
5. `formatMessage` / `source.formatMessage` 產生 Discord `content`
6. `sendWebhook` POST 至 Discord（預設 `SUPPRESS_EMBEDS`；或 dry-run）

本機開發可透過 Express 測試頁手動觸發 `/api/preview`、`/api/run`。

## 目錄

- `src/sources/` — 消息源介面與各來源實作（見 [sources.md](sources.md)）
- `src/fetchers/` — 低階 RSS / HTML 解析
- `src/filters/` — 共用關鍵字 helper
- `src/discord/` — 格式化與 webhook
- `src/storage/` — SQLite
- `src/pipeline/` — 編排
- `src/server/` — 測試用 HTTP API
