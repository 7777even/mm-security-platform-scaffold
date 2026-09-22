# Design: 事故救援契约 description 同步「动态快讯按事件隔离」

## 决策

- **契约优先、文字同步**：后端实现已落地（V63 + 服务按 `incident_id` 隔离），本 Change 仅把契约 description 与实现对齐，使 `docs/api/accident-rescue.openapi.json` 作为机器可读真源同时承担「人读语义说明」职责（四铁律要求字段有中文 description）。
- **不新增 schema**：隔离键 `incident_id` 为后端内部字段，不对外暴露；`RescueDynamicEntry` 结构不变，前端 `gen:api-types` 仅 JSDoc 文字差异。

## 数据流（不变）

`RescueDynamicsPanel` → `fetchAccidentRescue(eventId)` → `GET /accident/rescue-incident?eventId=...` → `dto.dynamics`（后端已按事件隔离）→ 面板渲染。前端无需感知 `incident_id`。

## 风险

- 无：纯文档同步，不涉及运行时逻辑。
