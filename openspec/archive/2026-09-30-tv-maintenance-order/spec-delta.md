# 契约增量（spec-delta）：tv.openapi.json 维修工单下钻

## 前端契约变更（真源）

### 新增 schema

- `TvMaintenanceOrderItem`：维修工单明细项（14 字段，详见后端 Change `2026-09-30-tv-maintenance-order` 的 spec-delta）。

### 新增端点（契约路径，前端消费）

- `GET /tv/maintenance-orders`（query `status?`）：返回 `TvMaintenanceOrderItem[]`（可能为空）。
- `GET /tv/maintenance-orders/{id}`：返回 `TvMaintenanceOrderItem`；工单不存在 404。

### 受影响端点

- `GET /tv/overview`：响应 `TvOverview.maintenanceOrders[]` 计数来源由 `fac_tv_stat_item.MAINTENANCE` 切换为 `fac_tv_maintenance_order GROUP BY order_status`（`TvMaintenanceOrder` 结构不变，仅数据真源变更）。

### 不受影响

- 端点路径与 method 不变；仅 schema 新增 + overview 数据真源变更（向后兼容）。

## 守门

- `npm run gen:api-types` 类型 diff 0。
- 后端 `scripts/check-api-contract.mjs --strict`：路由 0 差异 / schema 0 漂移。
