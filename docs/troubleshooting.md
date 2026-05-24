# 故障排除

## OpenAI RSS 403

確認 `HTTP_USER_AGENT` 已設定。VPS 若被擋可嘗試更新 User-Agent 或稍後重試。

## Discord webhook 失敗

- 檢查 `DISCORD_WEBHOOK_URL` 是否正確
- 訊息是否超過 2000 字元
- 使用 `POST /api/test-webhook` 或 `POST /api/send` 測試

## 多則訊息看起來黏在一起

預設已關閉連結 embed（`SUPPRESS_EMBEDS`）並在 URL 使用 `<...>`。若仍看到大圖預覽，確認執行的是最新版程式。

裝飾線放在訊息**開頭**容易緊貼**上一則**的 embed；目前改為開頭留白 + 結尾 `-#` 小字，並依賴關閉 embed。

## 沒收到通知

- 文章可能被 filter 擋下（測試頁「已過濾」區）
- 是否已 `sent_at`（去重）
- 是否超過 `MAX_NOTIFICATIONS_PER_SOURCE`（每來源獨立配額）
- `DRY_RUN` 是否為 `true`

## cron 時間不對

確認 `TZ=Asia/Taipei` 與 `CRON_SCHEDULE` 表達式。

## Anthropic 解析失敗

官網 HTML 改版時更新 `src/fetchers/anthropicHtml.ts` 與 `tests/fixtures/`。

## SQLite 檔案太大

- 確認定時任務有跑（`pm2 logs` 應見 `Pruned N article(s)`）
- 調低 `ARTICLE_RETENTION_DAYS`（例如 `14`）
- 手動：`sqlite3 data/watcher.db "VACUUM;"`
