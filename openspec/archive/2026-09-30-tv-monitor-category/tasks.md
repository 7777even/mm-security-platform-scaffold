# 任务清单：工业电视概览下钻真实点位

## 1. 契约真源

- [x] `docs/api/tv.openapi.json`：`TvMonitorSummary.monitorCategory` / `TvOverviewItem.category` / `TvMonitorUpsertRequest.monitorCategory`
- [x] `npm run gen:api-types` 重新生成 TS 类型（tv.ts 等）

## 2. 类型与 composable

- [x] `src/services/tv.ts` 加 `monitorCategory` / `category` 可选字段
- [x] `useTvVideoDetail.ts` 列表视图 payload 加 `category` 透传

## 3. 列表面板

- [x] `VideoMonitorListPanel.vue`：view 加 `category`；`monitors` 按 `monitorCategory === cat` 过滤

## 4. 概览面板

- [x] `VideoOverviewPanel.vue`：替换字典展示为透明化口径 + 按 category 下钻真实点位；action 改为"查看该分类真实监控点位 →"

## 5. 验证

- [x] `vue-tsc --noEmit` 0 error
- [x] `eslint` 0 error
- [x] fm-tv 子应用 `vite build` 成功
- [x] 跨库 `check-api-contract.mjs --strict` 0 漂移（可比 273）
