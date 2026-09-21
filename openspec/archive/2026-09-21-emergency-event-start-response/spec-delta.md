# Spec Delta

## emergency-event（契约）

- 新增 `POST /emergency-events/{id}/start-response`：启动应急响应。参数 `id`(path)，返回 `EmergencyEventItem`。
  无新增 schema（复用 `EmergencyEventItem`）。

## 事故救援处置页

- `responseStarted` 由聚合 `status`（`processing` / 中文「处置中」）派生 + 本地乐观覆盖 → 刷新/深链后仍「响应已启动」。
- 演练模式（`isDrillMode`）下 `report` / `start-response` 均不调用写端点（仿真本地流程）。
- `autostart` 自动启动依赖并入 `eventId`，避免设置期空跑。
