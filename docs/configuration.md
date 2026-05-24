# 環境設定

複製 `.env.example` 為 `.env`。

| 變數 | 說明 | 預設 |
|------|------|------|
| `DISCORD_WEBHOOK_URL` | Discord Webhook URL（真送必填） | 空 |
| `CRON_SCHEDULE` | cron 表達式 | `0 20 * * *` |
| `TZ` | 時區 | `Asia/Taipei` |
| `DRY_RUN` | `true` 時不 POST Discord | `false` |
| `MAX_NOTIFICATIONS_PER_SOURCE` | **每個消息源**每輪最多發幾則 | `3` |
| `MAX_NOTIFICATIONS_PER_RUN` | 已棄用別名，等同 per-source（向後相容） | — |
| `PORT` | 測試頁埠 | `3000` |
| `HOST` | 綁定位址（建議本機 `127.0.0.1`） | `127.0.0.1` |
| `ENABLE_TEST_UI` | 是否啟用測試頁 | `true` |
| `DATABASE_PATH` | SQLite 路徑 | `./data/watcher.db` |
| `ARTICLE_RETENTION_DAYS` | 定時任務刪除幾天前的 SQLite 紀錄（與查詢窗口無關） | `30` |
| `ARTICLE_LOOKBACK_DAYS` | 只處理 `TZ` **昨天起**連續 N 個日曆日（不含今天）；`1` = 僅昨天；`0` = 不限制 | `1` |
| `HTTP_USER_AGENT` | 抓取時 User-Agent | 見 `.env.example` |

**切勿**將 `.env` 提交至 git。
