## Status

可归档 · 2026-08-28 验证：type-check 0 error；改动文件 eslint 0 error（全量 lint 存在与本次无关的既有基线错误，不在本变更范围）。

## 1. OpenSpec 规格（文档先行）

- [x] 1.1 编写 `openspec/specs/mgmt-scaffold/spec.md`（布局骨架 / token 纪律 / 工作台卡片）。
- [x] 1.2 编写 `openspec/changes/mgmt-scaffold/{proposal.md, tasks.md}`。

## 2. token 单一真源

- [x] 2.1 在 `src/styles/tokens.css` 的 `[data-theme='mgmt']` 新增 `--mgmt-header-pill-hover-bg`、`--mgmt-card-shadow-hover`。

## 3. 消除硬编码色值

- [x] 3.1 `apps/mgmt/App.vue:326` 的 `rgb(255 255 255 / 20%)` 改为 `var(--mgmt-header-pill-hover-bg)`。
- [x] 3.2 `apps/mgmt/views/workbench.vue:285` 的 `box-shadow: 0 4px 12px rgb(26 53 80 / 8%)` 改为 `var(--mgmt-card-shadow-hover)`。

## 4. 验证

- [x] 4.1 `npm run type-check` 0 error。
- [x] 4.2 改动文件 `eslint` 0 error（全量 lint 既有基线错误与本次无关，不纳入）。
