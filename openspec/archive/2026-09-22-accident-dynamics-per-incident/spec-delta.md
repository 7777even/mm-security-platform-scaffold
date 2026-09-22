# Spec Delta: 事故救援契约 description 同步「动态快讯按事件隔离」

Capability: `screen-data-wiring`

## 新增

无新增 Requirement。本 Change 仅同步契约 `docs/api/accident-rescue.openapi.json` 的 description 文字，使「动态快讯按事件隔离」语义在契约真源可见。

## 修改

- `docs/api/accident-rescue.openapi.json` 端点与 `dynamics` 字段 description（文字层面说明按事件隔离；字段结构 `RescueDynamicEntry` 不变）。

## 移除

无。

## 说明

- 行为由后端同 Change（`emergency-event` capability 的「动态快讯按事件隔离」Requirement）驱动；前端 `RescueDynamicsPanel` 按 `eventId` 拉取，无需任何代码/类型结构变更。
- `incident_id` 为后端内部隔离键，不在契约暴露。
