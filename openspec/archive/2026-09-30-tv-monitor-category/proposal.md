# 提案：工业电视概览下钻到真实分类点位（contract + UI）

> **状态：`done` —— 已实现并验证（vue-tsc 0 / eslint 0 / fm-tv 构建成功）。归档 Change。**
> 配套后端 Change：`backend-scaffold/openspec/archive/2026-09-30-tv-monitor-category`。

## 背景

与后端 B 方案配套：后端给真实表加 `monitor_category` 并实时聚合概览后，前端需要 ① 契约同步新增字段；② 概览卡片按 `category` 精确下钻到对应分类的真实监控点位（替代原先"其它"类无关联的字典展示）。

## 目标

1. `docs/api/tv.openapi.json` 新增 `TvMonitorSummary.monitorCategory` / `TvOverviewItem.category` / `TvMonitorUpsertRequest.monitorCategory`（契约真源）。
2. `npm run gen:api-types` 重新生成 TS 类型。
3. `useTvVideoDetail` 列表视图支持 `category` payload；`VideoMonitorListPanel` 按 `monitorCategory === cat` 过滤。
4. `VideoOverviewPanel` 详情从"展示字典值"改为"透明化口径 + 按 category 下钻真实点位"，action 文案"查看该分类真实监控点位 →"。

## 非目标（本期不做）

- 不改动重大危险源（MAJOR_HAZARD）的下钻（仍走既有 hazard 列表）。
- 不改 `tv.ts` 之外的契约域。

## ADR

- **ADR-1 契约真源在 frontend**：后端 DTO 对齐本文件，跨库四同步经 `check-api-contract.mjs --strict` 守门。
- **ADR-2 下钻键=category code**：列表过滤 `monitorCategory === item.category`，与后端 `GROUP BY` 口径一致。

## 风险

- 改 `src/screen/` 共享源码会令其它子应用产物 stale，需全量 `npm run build:subapps` 整体预览。
