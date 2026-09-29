# Tasks

## 1. 契约同步

- [x] `docs/api/tv.openapi.json`：`TvSnapshotIngestRequest` 补 `alarmId`/`alarmType`；`TvMonitorDetail`/`TvSnapshotItem` 补 `zoneCode`/`zoneName`（+ 快照 `alarmId`/`alarmType`）；新增 `TvMonitorSummary` schema
- [x] 新增 `/tv/monitors`、`/tv/monitors/{code}/snapshots` 路径；`/tv/snapshots` 增 `monitorCode`/`zone`/`startTime`/`endTime` 参数与示例
- [x] `node scripts/validate-api-contracts.mjs` PASS（33 域）
- [x] `npm run gen:api-types` 重生成（TvSnapshotIngestRequest 等类型已含新字段）

## 2. 服务层

- [x] `src/services/tv.ts`：扩展 `TvSnapshotItem`/`TvMonitorDetail`；新增 `TvMonitorSummary`/`TvSnapshotQuery`；`fetchTvSnapshots` 透传过滤；新增 `fetchTvMonitors` / `fetchTvMonitorSnapshots`

## 3. 二级回放页

- [x] `src/views/tv/playback.vue`：防区/设备/时间筛选 + 快照网格 + 分页 + `onMounted` 预选 + `back()`
- [x] `router/index.ts` `SECONDARY_ROUTES` 增 `/tv/playback`（`fm-tv-playback`，perm `video:view`，hidden）
- [x] `src/shell/fmRouteNameMap.ts` 增 `tvPlayback: '/tv/playback'`
- [x] `VideoMonitorBrowserPanel.vue` 头部「历史回放 ›」+ 单设备「回放」角标（带 `query.monitor` 预选）

## 4. 验证与归档

- [x] `npm run type-check`（vue-tsc）PASS
- [x] 后端 `node scripts/check-api-contract.mjs --strict` 路由差异 0 / schema 漂移 0（EXIT=0）
- [x] spec-delta 合入 `openspec/specs/tv/spec.md`（AMEND 两条 Requirement）
- [x] 归档 `git mv` 到 `openspec/archive/2026-09-29-tv-zone-linkage`
- [x] `node scripts/check-openspec-hygiene.mjs` 通过
