# Proposal: 事故救援「事件预警」状态持久化（前端）

## Why

后端新增 `POST /emergency-events/{id}/report` 写端点（见后端同名 Change）。前端需接线使「事件预警」
按钮真正落库，并据返回的 `reported` 在处置页派生「已预警」状态，刷新后保留，与应急指挥大屏列表口径一致。

## What Changes

- 契约真源 `docs/api/emergency-event.openapi.json` 增加 `POST /emergency-events/{id}/report`（无新增 schema）。
- `services/emergencyEvent.ts` 新增 `reportEmergencyEvent`；`services/accidentRescue.ts`
  `AccidentRescuePayload.status` 联合类型加入 `warning`。
- `IncidentDetailPanel`：`confirmWarning` emit('report')，新增「已预警」状态徽标；`accident-status` 联合类型加 `warning`。
- `AccidentEmergencyRescue`：监听 `@report` 调 `reportEmergencyEvent` 并刷新聚合；`displayIncidentStatus` 含 `warning`。
- `AccidentRescueMap`：`incidentStatus` 联合类型加 `warning`。

## Capabilities

- 处置页「事件预警」持久化；刷新/跨页后状态保持「已预警」。

## Impact

- 仅新增调用 + 状态派生，无存量组件结构变更。
