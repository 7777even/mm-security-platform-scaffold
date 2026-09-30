# 契约增量（spec-delta）：tv.openapi.json 分类字段

## 前端契约变更（真源）

### 新增字段

- `TvMonitorSummary.monitorCategory: string|null`
- `TvOverviewItem.category: string|null`
- `TvMonitorUpsertRequest.monitorCategory: string|null`

字段含义与后端对齐，详见后端 Change `2026-09-30-tv-monitor-category` 的 spec-delta。

### 受影响端点（契约路径，前端消费）

- `GET /tv/monitors`（TvMonitorSummary）
- `GET /tv/overview`（TvOverviewItem[]）
- `POST/PUT /tv/monitors`（TvMonitorUpsertRequest）

### 不受影响

- 端点路径与 method 不变；仅 schema 字段新增（向后兼容，旧前端不传 monitorCategory 不影响写回）。

## 守门

- `npm run gen:api-types` 类型 diff 0。
- 后端 `scripts/check-api-contract.mjs --strict`：路由 0 差异 / schema 0 漂移。
