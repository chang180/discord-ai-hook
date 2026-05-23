# 部署

## VPS 首次部署

### 前置（clone 前）

- Node.js **20+**、git、**pm2**
- 編譯原生模組（`better-sqlite3`）：Debian/Ubuntu 建議 `sudo apt install -y build-essential`
- 準備好 Discord **Webhook URL**（只寫在 VPS 的 `.env`，不進 git）

### 手動步驟

1. `git clone https://github.com/chang180/discord-ai-hook.git /opt/discord-ai-hook`（路徑可自訂）
2. `cd /opt/discord-ai-hook`
3. `cp .env.example .env` 並編輯：
   - `DISCORD_WEBHOOK_URL`（必填）
   - `ENABLE_TEST_UI=false`（生產建議）
   - `ARTICLE_RETENTION_DAYS=30`（預設即可，見下方說明）
4. `npm ci && npm run build`
5. `pm2 start ecosystem.config.cjs && pm2 save`
6. `pm2 startup`（依提示執行 `sudo` 指令，設定開機自啟）
7. `pm2 logs discord-ai-hook` 確認有 `Watcher scheduled` 日誌

### 用 Cursor / Claude Agent CLI 代勞

登入 VPS 並 `git clone` 進目錄後，可把下面整段貼給 Agent：

```text
請在目前的 discord-ai-hook 目錄完成首次生產部署：
1. 若沒有 .env，從 .env.example 複製，並提示我填入 DISCORD_WEBHOOK_URL
2. 設定 ENABLE_TEST_UI=false、ARTICLE_RETENTION_DAYS=30
3. 執行 npm ci && npm run build
4. pm2 start ecosystem.config.cjs && pm2 save
5. 執行 pm2 status 與 pm2 logs --lines 20，回報是否 online
若缺少 Node/pm2/build-essential，列出需要安裝的指令。
不要將 webhook 寫入 git 或貼在聊天紀錄。
```

Agent **能完成**：依賴安裝、build、pm2 啟動與檢查。  
**需你親自處理**：Webhook 內容、首次 `pm2 startup` 的 `sudo`（若 Agent 無權限）、GitHub Actions Secrets（見下文）。

### 之後更新程式

- **方式 A**：GitHub Actions → **Deploy to VPS** → Run workflow（需先設 Secrets，且 VPS 上已至少 `pm2 start` 過一次）
- **方式 B**：SSH 進主機後 `git pull && npm ci && npm run build && pm2 reload ecosystem.config.cjs`

## 資料庫與磁碟

排程任務在**每日 cron 執行時**會：

1. 刪除 `first_seen_at` 超過 `ARTICLE_RETENTION_DAYS`（預設 30 天）的 `articles` 列
2. 若有刪除則執行 SQLite `VACUUM` 縮小 `watcher.db`

手動從測試頁觸發 `/api/run` **不會**做清理，僅定時任務會 prune。

## GitHub Actions Secrets

| Secret | 說明 |
|--------|------|
| `VPS_HOST` | VPS IP 或網域 |
| `VPS_USER` | SSH 使用者 |
| `VPS_SSH_KEY` | 私鑰 |
| `VPS_DEPLOY_PATH` | 部署目錄 |
| `VPS_SSH_PORT` | 可選，預設 22 |

`DISCORD_WEBHOOK_URL` **只放在 VPS 的 `.env`**，不要寫入 GitHub Secrets。

## CD（手動）

GitHub → Actions → **Deploy to VPS** → Run workflow

流程：runner 上 test + build → SSH → `git pull` → `npm ci` → `build` → `pm2 reload`

## 回滾

```bash
cd /opt/discord-ai-hook
git reset --hard <previous-sha>
npm ci && npm run build
pm2 reload ecosystem.config.cjs
```
