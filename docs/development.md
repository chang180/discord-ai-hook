# 本機開發

## 啟動

```bash
npm run dev
```

瀏覽 http://127.0.0.1:3000/

## Discord 訊息預覽（WYSIWYG）

測試頁會依 **消息源分區** 顯示 `formatMessage()` 產生的 **完整 `content`**（每來源最多 3 則），與實際 webhook 發送內容一致。

| 按鈕 | 行為 |
|------|------|
| 載入預覽 | `GET /api/preview`，不寫入 DB、不發送 Discord |
| Dry Run | `POST /api/run` + `dryRun: true`，寫入 DB 但不發送 |

本機預覽**不會**自動推送；真送需排程、`POST /api/run`（`dryRun: false`）或 `POST /api/send`。

### 訊息格式

每則 `content` 結構（見 [`formatMessage.ts`](../src/discord/formatMessage.ts)）：

- 來源標籤、標題、原文連結
- URL 以 `<https://...>` 包住（避免 Discord 自動展開連結預覽）
- 開頭 **2 行空白**（與上一則拉開；避免裝飾線緊貼上一則 embed）
- 結尾 **`-# · · ·`** 小字尾註（Discord subtext，輕量收尾）

發送時 [`sendWebhook`](../src/discord/sendWebhook.ts) 預設帶 `SUPPRESS_EMBEDS`（`flags: 4`），關閉大型 embed 卡片，避免多則訊息視覺上黏在一起。

每則預覽顯示字元數；超過 2000 會標示警告。

## API

- `GET /api/preview` — 回傳 `{ wouldSend, filtered, truncated, bySource: [...] }`
- `POST /api/run` — body `{ "dryRun": true }`
- `POST /api/send` — body `{ "url": "..." }` 或 `{ "content": "..." }`
- `POST /api/test-webhook`
- `GET /api/status`
