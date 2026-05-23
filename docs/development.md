# 本機開發

## 啟動

```bash
npm run dev
```

瀏覽 http://127.0.0.1:3000/

## Discord 訊息預覽（WYSIWYG）

測試頁會顯示 `formatMessage()` 產生的 **完整 `content`**，與實際 webhook 發送內容一致。

| 按鈕 | 行為 |
|------|------|
| 預覽 | `GET /api/preview`，不寫入 DB |
| Dry Run | `POST /api/run` + `dryRun: true` |
| 執行並發送 | 真送 Discord（需 webhook） |
| Webhook 連線測試 | 固定測試文案 |

每則預覽顯示字元數；超過 2000 會標示警告。

## API

- `GET /api/preview` — 回傳 `{ wouldSend: [{ article, content }], filtered, truncated }`
- `POST /api/run` — body `{ "dryRun": true }`
- `POST /api/send` — body `{ "url": "..." }` 或 `{ "content": "..." }`
- `POST /api/test-webhook`
- `GET /api/status`
