# Tasks

- [x] 契约 `docs/api/emergency-event.openapi.json` 增加 `POST /emergency-events/{id}/start-response`
- [x] `services/emergencyEvent.ts` 新增 `startEmergencyResponse`
- [x] `handleStartEmergencyResponse` 改 async（调接口 + `loadIncident` 刷新）
- [x] `responseStarted` 改 computed（本地覆盖 ∨ 聚合 status processing/处置中）；`displayIncidentStatus` 归一化
- [x] 演练守卫：`handleStartEmergencyResponse` / `handleEventReport` 在 `isDrillMode` 时返回
- [x] `autostart` watcher 依赖并入 `eventId`
- [x] `vue-tsc` / `eslint` 0 error；`vitest` 全绿；`check-api-contract --strict` 0 差异
