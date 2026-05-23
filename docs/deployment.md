# 部署

## VPS 首次部署

1. 安裝 Node.js 20+、git、pm2
2. `git clone` 至 `/opt/discord-ai-hook`（或自訂路徑）
3. `cp .env.example .env` 並填入 `DISCORD_WEBHOOK_URL` 等
4. 建議生產環境：`ENABLE_TEST_UI=false`
5. `npm ci && npm run build`
6. `pm2 start ecosystem.config.cjs && pm2 save`
7. `pm2 startup`（依主機設定開機自啟）

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
