# 设计：维修工单下钻真实工单

## 契约（docs/api/tv.openapi.json · 唯一真源）

- 新增 `TvMaintenanceOrderItem` schema（14 字段：id/orderNo/deviceName/deviceCode/faultDesc/status/statusLabel/assignee/department/zoneCode/createdAt/planFinishTime/actualFinishTime/handleDesc）。
- 新增路径 `GET /tv/maintenance-orders`（query `status?`）、`GET /tv/maintenance-orders/{id}`（404 工单不存在）。

## 类型与服务（src/services/tv.ts）

- 新增 `TvMaintenanceOrderItem` interface（字段可空，与契约对齐）。
- 新增 `fetchTvMaintenanceOrders(status?)`：`/tv/maintenance-orders` + `params.status`；空数组兜底、绝不回灌假数据。
- 新增 `fetchTvMaintenanceOrder(id)`：`/tv/maintenance-orders/{id}`；无数据返回 `null`。

## 面板（MaintenanceOrderPanel.vue）

- 三状态卡片（未接单/处理中/已超时），点击 `openDetail(order)` 调 `fetchTvMaintenanceOrders(status)` → 第一层 `InfoDetailDialog`（字段列表 + `itemsClickable`）展示该状态工单列表。
- 列表项点击 `handleItemClick(item)` → 第二层 `InfoDetailDialog` 展示 `fetchTvMaintenanceOrder(item.id)` 逐单完整明细（工单编号/设备/故障描述/状态/派单人/部门/防区/创建时间/计划完成/实际完成/处理说明）。
- `STATUS_BY_LABEL` 映射：未接单→PENDING / 处理中→PROCESSING / 已超时→OVERTIME。
- 数据来源文案："实时维修工单台账（按工单状态实时统计）"；两个对话框均 `Teleport to="#app"`。
