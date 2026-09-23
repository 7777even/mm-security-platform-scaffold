## Why

后端已落地生产报警写回端点 `PUT /api/v1/production/alarms/{id}`（production:ack，@Version，@RealtimeSync 广播 `production.alarm.changed`）。前端此前仅有「详情展示 + 内存态处置」，中央告警详情面板 `AlarmDetailPanel` 的处置动作只分支消防报警（`fireAlarmId`）与周界报警（`perimeterAlarmId`），生产报警（`productionAlarmId`）点确认 / 处置 / 误报标记不会落库；`ProductionAlarmPanel` / `ProductionAreaView` 也只在 onMounted 拉一次，处置后不刷新。需要把前端的处置动作与实时刷新接上，使得生产报警处置真正落库并多端实时反映，与消防、周界告警体验一致。

## What Changes

- 契约 `docs/api/production.openapi.json` 新增 `PUT /production/alarms/{id}` 路径（权限码 `production:ack`、中文 example）与 `ProductionAlarmUpdateRequest` schema（status / falseAlarm / handleResult / handleTime / dispatchPersonnel / notifyMethod 全可选）；`ProductionAlarmItem` status 字典补 `已确认`，并增 5 个回填字段。
- `npm run gen:api-types` 重新生成 `src/types/generated/production.ts`，包含 update 路径类型与上述 schema。
- `src/services/production.ts` 新增 `ProductionAlarmUpdatePayload` 接口 + `updateProductionAlarm(id, payload)` 写回函数（PUT，离线显式报错，镜像 `updateFireAlarm`）+ `productionAlarmChanged` ref 与 `touchProductionAlarmChanged()`，用于同端写回成功后即时刷新信号。
- `src/screen/lib/data/alarmDetailMock.ts` 的 `AlarmDetailItem` 加 `productionAlarmId?: number`；`productionAlarmToDetail` 写入 `productionAlarmId: item.id`（后端 `fac_production_alarm.id`）并回填 falseAlarm / handleResult 等真实字段；状态映射：后端 `未处置/已确认/处置中/已处置` ↔ 详情态 `未确认/已确认/处理中/已处理`。
- `src/screen/components/common/AlarmDetailPanel.vue` 处置动作统一走 `persistAlarm` 分发器，新增 `persistProductionAlarm` 分支（按 `productionAlarmId`），写回经 `mapDetailStatusToProduction` 映射回后端中文字典；成功 `touchProductionAlarmChanged()`。
- `src/screen/components/panels/production/ProductionAlarmPanel.vue` 与 `src/screen/views/ProductionAreaView.vue` 在 onMounted 订阅 `subscribeDomainChange('production.alarm', ...)`，并 `watch(productionAlarmChanged, ...)` 重拉最新生产报警；onUnmounted 退订。

## Impact

- 前端：处置动作真正落库（生产域），与消防 / 周界报警体验一致；面板实时刷新（同端写回 + 跨端 / 跨标签 ws 广播双链路）。
- 状态字典映射：详情统一态 `处理中` ↔ 后端 `处置中`、`已确认` ↔ 后端 `已确认`，写回时 `mapDetailStatusToProduction` 映射回，避免字典错位被后端 `PARAM_INVALID` 拒。
- 既有消防 / 周界报警写回行为不变；纯内存态演示告警（无 fireAlarmId / perimeterAlarmId / productionAlarmId）仍直接放行。
