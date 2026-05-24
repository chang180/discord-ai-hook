# 過濾規則

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
