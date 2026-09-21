# Proposal: 事故救援「启动应急响应」状态持久化（前端）

## Why

后端新增 `POST /emergency-events/{id}/start-response` 写端点（见后端同名 Change）。前端需接线使处置页
「启动应急响应」真正落库，并在刷新 / 深链后据聚合 `status` 保持「响应已启动」；同时为演练模式加守卫，避免误写真实事件。

## What Changes

- 契约真源 `docs/api/emergency-event.openapi.json` 增加 `POST /emergency-events/{id}/start-response`（无新增 schema）。
- `services/emergencyEvent.ts` 新增 `startEmergencyResponse`。
- `AccidentEmergencyRescue`：`handleStartEmergencyResponse` 改 async（调接口 + 刷新）；`responseStarted` 由 `ref` 改 `computed`
  （= 本地乐观覆盖 ∨ 聚合 `status` 为 `processing`/「处置中」），`displayIncidentStatus` 归一化中文标签。
- 演练守卫：`handleStartEmergencyResponse` / `handleEventReport` 在 `isDrillMode` 时直接返回（演练为仿真本地流程，不落库）。
- `autostart` watcher 依赖并入 `eventId`，确保「去处置」自动启动在事件加载后才触发。

## Capabilities

- 处置页「启动应急响应」持久化（状态 processing / 处置中）；刷新后按钮与状态均保持。

## Impact

- 仅新增调用 + 状态派生 + 守卫，无存量组件结构变更。
