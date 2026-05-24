# 過濾規則

## 發布日窗口（`ARTICLE_LOOKBACK_DAYS` + `TZ`）

在關鍵字過濾**之前**，依 `publishedAt` 篩選（以 `TZ` 的**日曆日**計算，**不含今天**）：

| 值 | 行為 |
|----|------|
| `1`（預設） | **僅昨天**（例：`TZ=Asia/Taipei`、5/24 20:00 跑 → 只抓 5/23 發布） |
| `7` | 昨天起往前共 7 個日曆日（不含今天） |
| `0` | 不限制（本機預覽舊文、fixture 測試） |

- 無 `publishedAt` 的項目（多為 Anthropic Engineering 列表）**不擋**，仍走關鍵字與配額。
- 超出窗口者記為 `date:outside_lookback_Nd`。

## Include（Anthropic News、OpenAI 等，Engineering 除外）

標題需包含其一（不分大小寫）：API、SDK、Agent、Claude Code、Codex、Tool、Model、GPT、Release、Harness、MCP、Eval

## Exclude（標題或 category）

partnership、partners、acquires、acquisition、KPMG、PwC、Gates Foundation、investment、enterprise AI services、Glasswing

## OpenAI 額外

`category === Company` 且標題無 engineering 關鍵字 → 略過

## Anthropic Engineering

預設較寬鬆通過（仍受 exclude 限制）

## 速率

`MAX_NOTIFICATIONS_PER_SOURCE` 限制**每個消息源**每輪發送數量（預設 3）。

各來源專屬規則：見 `src/sources/openaiSource.ts`、`anthropicNewsSource.ts`、`anthropicEngineeringSource.ts`。

共用關鍵字：編輯 `src/filters/keywordInclude.ts`、`keywordExclude.ts`。
