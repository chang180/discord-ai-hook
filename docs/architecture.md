# 架構

## 流程

1. `node-cron` 依 `CRON_SCHEDULE` 觸發（預設每日 20:00）
2. `pruneOldArticles` 刪除超過 `ARTICLE_RETENTION_DAYS` 的 SQLite 紀錄並 `VACUUM`
3. `fetchAllArticles` 抓取 OpenAI RSS、Anthropic HTML
4. SQLite 記錄已見文章，跳過已發送
5. `evaluateArticle` 過濾
6. `formatMessage` 產生 Discord `content`
7. `sendWebhook` POST 至 Discord（或 dry-run）

本機開發可透過 Express 測試頁手動觸發 `/api/preview`、`/api/run`。

## 目錄

- `src/fetchers/` — 資料來源
- `src/filters/` — 過濾規則
- `src/discord/` — 格式化與 webhook
- `src/storage/` — SQLite
- `src/pipeline/` — 編排
- `src/server/` — 測試用 HTTP API
