# Tasks: perimeter-alarm-writeback（前端）

- [x] `docs/api/security.openapi.json` 新增 `PUT /security/perimeter-alarms/{id}` 路径 + `PerimeterAlarmUpdateRequest` schema（四铁律齐备）
- [x] `npm run gen:api-types` 重生成 `src/types/generated/security.ts`（含 put 路径类型）
- [x] `src/services/security.ts` 新增 `updatePerimeterAlarm` / `PerimeterAlarmUpdatePayload` + `perimeterAlarmChanged` / `touchPerimeterAlarmChanged`（镜像 updateFireAlarm）
- [x] `src/screen/lib/data/alarmDetailMock.ts`：`AlarmDetailItem` 加 `perimeterAlarmId?: number`，`perimeterAlarmToDetail` 写入该 id，`normalizePerimeterStatus` 兼容 `已派单`
- [x] `src/screen/components/common/AlarmDetailPanel.vue`：原 `persistFireAlarm` 扩为统一 `persistAlarm` 分发器（fireAlarmId→消防 / perimeterAlarmId→周界），全部处置动作改调分发器
- [x] `src/screen/components/panels/security/SecurityStatusPanel.vue`：`subscribeDomainChange('security.perimeter-alarm')` + `watch(perimeterAlarmChanged)` 实时刷新，`onUnmounted` 退订
- [x] 门禁：前端 `type-check` 0 错、`vitest` 373/373（含 AlarmDetailPanel.spec 10 例）、`lint` 0 error
- [x] 归档至 openspec/archive/（全勾后按纪律归档，补 spec-delta）
