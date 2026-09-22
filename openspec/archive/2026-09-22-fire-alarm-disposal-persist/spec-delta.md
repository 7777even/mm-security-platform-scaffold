# Spec Delta: fire-alarm-disposal-persist（前端）

## 契约 `docs/api/fire-alarm.openapi.json`

- `FireAlarmUpdateRequest.properties` 新增 `handleResult` / `handleTime` / `dispatchPersonnel` / `notifyMethod`（均可空，仅非空时覆盖）。
- `FireAlarmItem.properties` 新增上述 4 字段（可空，向后兼容）。
- `PUT /fire-alarms/{alarmId}` 描述与 example 补充处置字段说明。

## 类型与服务

- `src/services/alarm.ts`：`FireAlarmItem` 与 `FireAlarmUpdatePayload` 各加 4 字段；`updateFireAlarm` mock 合并回显。
- `src/screen/lib/data/alarmDetailMock.ts`：`fireListItemToDetail` 回填 4 字段（逗号串↔数组、APP/SMS↔布尔）。

## 组件

- `src/screen/components/common/AlarmDetailPanel.vue`：`persistFireAlarm` 支持写回 4 处置字段；
  `addPersonnel` / `removePersonnel` / `toggleNotify` / 处置文本失焦 / `submitHandle` 触发写回。
