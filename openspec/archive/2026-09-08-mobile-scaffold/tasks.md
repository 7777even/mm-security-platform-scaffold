## Status

可归档 · 2026-08-28 验证：type-check 0 error；改动文件 eslint 0 error（全量 lint 存在与本次无关的既有基线错误，不在本变更范围）。

## 1. OpenSpec 规格（文档先行）

- [x] 1.1 编写 `openspec/specs/mobile-scaffold/spec.md`（布局骨架 / token 纪律 / 首页 hero / 户外皮肤）。
- [x] 1.2 编写 `openspec/changes/mobile-scaffold/{proposal.md, tasks.md}`。

## 2. token 单一真源

- [x] 2.1 在 `src/styles/tokens.css` 的 `[data-theme='mobile']` 新增 `--mb-hero-stat-bg`。

## 3. 消除硬编码色值

- [x] 3.1 `apps/mobile/views/home.vue:314` 的 `rgb(255 255 255 / 18%)` 改为 `var(--mb-hero-stat-bg)`。

## 4. 验证

- [x] 4.1 `npm run type-check` 0 error。
- [x] 4.2 改动文件 `eslint` 0 error（全量 lint 既有基线错误与本次无关，不纳入）。
