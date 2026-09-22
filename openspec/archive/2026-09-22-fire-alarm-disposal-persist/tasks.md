# Tasks: fire-alarm-disposal-persist（前端）

- [x] 契约 `docs/api/fire-alarm.openapi.json`：`FireAlarmUpdateRequest` / `FireAlarmItem` 各加 4 字段 + PUT 描述/example。
- [x] `src/services/alarm.ts`：`FireAlarmItem` / `FireAlarmUpdatePayload` 加 4 字段；`updateFireAlarm` mock 合并。
- [x] `src/screen/lib/data/alarmDetailMock.ts`：`fireListItemToDetail` 回填 4 字段（数组/布尔↔逗号串）。
- [x] `AlarmDetailPanel.vue`：`persistFireAlarm` 扩展 + 派单/通知/处置文本/提交处置触发写回。
- [x] `npm run gen:api-types` 重新生成 `src/types/generated/fire-alarm.ts`；跑 `validate-api-contracts.mjs` / `vue-tsc` / `vitest run` / `gate:screen`。
- [x] 推送后：真实 8787 实例验证派单/通知/处置文本刷新后仍回显（已验证：4 字段经 PUT 落库并可在列表中回显）。
