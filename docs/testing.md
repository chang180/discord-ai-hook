# 測試

## 執行

```bash
npm test
npm run test:watch
npm run test:coverage
```

## 原則

- 測試**不打**真實 OpenAI、Anthropic、Discord
- 使用 `tests/fixtures/` 內 RSS / HTML
- SQLite 使用 `:memory:`

## 更新 fixture

1. 從官網取得精簡 HTML 或 RSS 片段
2. 存入 `tests/fixtures/`
3. 執行 `npm test`，調整 parser 或 fixture 直至通過

## CI

`ci.yml` 在每次 push / PR 執行 lint、test、build。

`deploy.yml` 手動部署前也會執行 `npm test`。
