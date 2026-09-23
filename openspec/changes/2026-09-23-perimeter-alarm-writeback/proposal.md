## Why

后端已落地周界入侵告警写回端点 `PUT /api/v1/security/perimeter-alarms/{id}`（security:perimeter-ack，@Version，@RealtimeSync 广播 `security.perimeter-alarm.changed`）。前端此前仅有「详情展示 + 内存态处置」，详情面板的写回逻辑只分支消防报警（`fireAlarmId`），周界告警（`perimeterAlarmId`）点确认/派单/处置不会落库；`SecurityStatusPanel` 也只在 onMounted 拉一次，处置后不刷新。需要把前端的处置动作与实时刷新接上，使得周界告警处置真正落库并多端实时反映。

## What Changes

- 契约 `docs/api/security.openapi.json` 新增 `PUT /security/perimeter-alarms/{id}` 路径（权限码 `security:perimeter-ack`、中文 example）与 `PerimeterAlarmUpdateRequest` schema（status / falseAlarm / handleResult / handleTime / dispatchPersonnel / notifyApp / notifySms 全可选）。
- `npm run gen:api-types` 重新生成 `src/types/generated/security.ts`，包含 `updatePerimeterAlarm` 路径类型与上述 schema。
- `src/services/security.ts` 新增 `PerimeterAlarmUpdatePayload` 接口 + `updatePerimeterAlarm(id, payload)` 写回函数（PUT，离线显式报错，镜像 `updateFireAlarm`）；新增 `perimeterAlarmChanged` ref 与 `touchPerimeterAlarmChanged()`，用于同端写回成功后即时刷新信号。
- `src/screen/lib/data/alarmDetailMock.ts` 的 `AlarmDetailItem` 加 `perimeterAlarmId?: number`；`perimeterAlarmToDetail` 写入 `perimeterAlarmId: alarm.id`（后端 `fac_perimeter_alarm.id`）；`normalizePerimeterStatus` 处理后端 `已派单` → 详情态 `处理中`。
- `src/screen/components/common/AlarmDetailPanel.vue` 处置动作（确认/开始处置/提交处置/误报标记/派单人员/通知方式/处置情况失焦/误报单选）统一走 `persistAlarm` 分发器，按 `fireAlarmId` / `perimeterAlarmId` 分支到消防或周界写回；周界写回成功 `touchPerimeterAlarmChanged()`。
- `src/screen/components/panels/security/SecurityStatusPanel.vue` 在 onMounted 订阅 `subscribeDomainChange('security.perimeter-alarm', ...)`，并 `watch(perimeterAlarmChanged, ...)` 重拉最新周界告警；onUnmounted 退订。

## Impact

- 前端：处置动作真正落库（周界域），与消防报警体验一致；面板实时刷新（同端写回 + 跨端/跨标签 ws 广播双链路）。
- 状态字典映射：详情统一态 `处理中` ↔ 后端 `已派单`（周界专用），写回时 `mapDetailStatusToPerimeter` 映射回，避免字典错位被后端 `PARAM_INVALID` 拒。
- 既有消防报警写回行为不变；纯内存态演示告警（无 fireAlarmId / perimeterAlarmId）仍直接放行。
