# 设计：概览下钻到真实分类点位

## 契约（docs/api/tv.openapi.json · 唯一真源）

- `TvMonitorSummary` 加 `monitorCategory`（PRODUCTION/BOUNDARY/CLOSED_GATE/OTHER_GATE/OTHER）。
- `TvOverviewItem` 加 `category`（MAJOR_HAZARD / 其余五类；空表示无下钻）。
- `TvMonitorUpsertRequest` 加 `monitorCategory`。

## 类型与 composable

- `src/services/tv.ts` 两接口加可选 `monitorCategory?` / `category?`。
- `useTvVideoDetail.ts` 的 list 视图 payload 加 `category?`；`openTvMonitorList` 透传。

## 列表面板（VideoMonitorListPanel）

- props.view 加 `category?`；`monitors` computed 在 `cat` 存在时 `source.filter(m => m.monitorCategory === cat)`。

## 概览面板（VideoOverviewPanel）

- 删除 `realMonitorCount` / `ensureRealMonitors` / `openRealMonitors`。
- 新增 `allMonitors` / `categoryMonitorCount` / `ensureCategoryMonitors(cat)` / `openCategoryMonitors(cat)`。
- 非 hazard 类 `openDetail` 调 `ensureCategoryMonitors(item.category)`；模板 action-label 改为"查看该分类真实监控点位 →"；详情字段透明化口径（实时数量 + 数据来源 + 该分类真实监控点 N 个）。
