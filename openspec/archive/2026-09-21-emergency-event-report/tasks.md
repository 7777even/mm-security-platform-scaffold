# Tasks

- [x] 契约 `docs/api/emergency-event.openapi.json` 增加 `POST /emergency-events/{id}/report`
- [x] `services/emergencyEvent.ts` 新增 `reportEmergencyEvent`
- [x] `services/accidentRescue.ts` `AccidentRescuePayload.status` 联合类型加入 `warning`
- [x] `IncidentDetailPanel` emit('report') + 「已预警」状态徽标 + 联合类型加 `warning`
- [x] `AccidentEmergencyRescue` 监听 `@report` 刷新聚合；`displayIncidentStatus` 含 `warning`
- [x] `AccidentRescueMap` `incidentStatus` 联合类型加 `warning`
- [x] `vue-tsc` / `eslint` 0 error；`check-api-contract.mjs --strict` 0 差异
