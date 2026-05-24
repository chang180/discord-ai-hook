# 消息源擴充指南

## ContentSource 介面

每個消息源在 [`src/sources/`](../src/sources/) 實作 `ContentSource`：

| 方法 | 用途 |
|------|------|
| `fetch` | 抓取並正規化為 `Article[]` |
| `evaluate` | 該來源專屬過濾規則 |
| `orderArticles` | 配額分配前的排序 |
| `getMaxPerRun` | 可選，覆寫每輪上限 |
| `formatMessage` | 可選，覆寫 Discord 文案 |

共用 exclude 關鍵字見 [`shared.ts`](../src/sources/shared.ts)。

## 新增來源步驟

1. 在 [`src/types.ts`](../src/types.ts) 的 `ArticleSource` 加入新 ID
2. 新增 `src/sources/fooSource.ts`
3. 註冊至 [`registry.ts`](../src/sources/registry.ts)
4. 在 [`formatMessage.ts`](../src/discord/formatMessage.ts) 的 `SOURCE_LABELS` 加入顯示名稱
5. 補 fixture 與 `tests/unit/sources/fooSource.test.ts`
6. 更新本文件

無需修改 `runWatcher`、cron 或 API 路由。

## 現有來源

| ID | 模組 | 過濾策略 |
|----|------|----------|
| `openai` | `openaiSource.ts` | exclude + Company 規則 + include |
| `anthropic_news` | `anthropicNewsSource.ts` | exclude + include |
| `anthropic_engineering` | `anthropicEngineeringSource.ts` | exclude + lookback 日期窗口（頁面有日期的文章）；Featured 置頂文章無日期，視同新文通過 |

## 配額

`MAX_NOTIFICATIONS_PER_SOURCE`（預設 3）對**每個來源**獨立計算。3 個來源時單輪最多約 9 則 Discord 訊息。
