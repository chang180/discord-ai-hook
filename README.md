# Discord AI Labs Watcher

> AI Engineering Intelligence Feed — 追蹤 OpenAI、Anthropic 官方動態，過濾後推送至 Discord。

不是 AI 新聞農場，而是面向 RD / Agent workflow 的高訊息密度通知。

## 功能

- 定時抓取 OpenAI RSS、Anthropic News / Engineering
- 關鍵字過濾，避免合作案、投資等洗版內容
- Discord Webhook 單向推送（無 Bot Gateway）
- Discord 推送：自動關閉連結預覽（`SUPPRESS_EMBEDS` + `<URL>`），開頭留白與 `-#` 小字尾註
- 本機測試頁：預覽與實際發送相同的 `content`（依消息源分區）
- SQLite 去重；**三消息源各 3 則/輪**（OpenAI、Anthropic News、Engineering）
- 每日排程（預設 20:00 `Asia/Taipei`）；`ARTICLE_LOOKBACK_DAYS=1` 預設只抓**昨天**（台北日曆日）發布
- 自動清理 30 天前 SQLite 紀錄

## Quick Start

```bash
cp .env.example .env
# 編輯 .env，填入 DISCORD_WEBHOOK_URL（本機真送時需要）

npm install
npm run dev
```

開啟 http://127.0.0.1:3000/ ，使用「預覽」查看 Discord 訊息格式。

## 指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 開發模式（HTTP + cron） |
| `npm run build` | 編譯 TypeScript |
| `npm start` | 執行編譯後程式 |
| `npm test` | 執行測試 |
| `npm run lint` | ESLint |

## 文件

詳見 [docs/README.md](docs/README.md)。

- [開發與 Discord 預覽](docs/development.md)
- [消息源擴充](docs/sources.md)
- [環境設定](docs/configuration.md)
- [部署與 GitHub Actions](docs/deployment.md)
- [測試](docs/testing.md)

## 生產部署

VPS 上使用 pm2，CD 透過 GitHub Actions 手動觸發。見 [docs/deployment.md](docs/deployment.md)。

## 技術棧

Node.js 20+、TypeScript、Express、SQLite、Vitest、pm2

## 授權

MIT
