# Proposal: add-fire-alarm-writeback（前端）

## 问题

消防页（`/fire`，fm-fire）的「告警详情」面板 `AlarmDetailPanel` 状态机（确认/开始处置/提交处置/标记误报）
只改内存态 `patchAlarmDetail`，**从不调后端**——用户确认报警后刷新即丢。同时详情经
`fireListItemToDetail` 映射时把后端 4 态压成 2 态，详情与真实记录状态脱节。

## 目标

把处置状态与误报标记写回后端 `PUT /fire-alarms/{alarmId}`，并让列表/卡片/声光报警源随写回刷新：

- 新增 `services/alarm.ts#updateFireAlarm(alarmId, payload)`（B3 客户端，离线显式报错、dev-mock 本地成功）。
- `screen AlarmItem` 增加 `fireAlarmId`，由 `toScreenAlarmFromFire` 携带真实 `fac_fire_alarm.alarmId`。
- `AlarmDetailItem` 增加 `fireAlarmId`；`fireAlarmToDetail` / `fireListItemToDetail` 填充之。
- **修正状态映射**：新增 `mapFireStatusToDetail`（ACTIVE→未确认 / ACKED→已确认 / DISPATCHED→处理中 / CLOSED→已处理）
  与 `mapDetailStatusToFire`（反向）。
- `AlarmDetailPanel` 在 fire 报警（有 `fireAlarmId`）的流转处**先写回、成功再改本地态**，
  失败提示且不流转；成功后触发 `fireAlarmChanged` 信号。
- `useScreenAlarmFeed` 增加 `fireAlarmChanged` / `touchFireAlarmChanged` / `reloadScreenFireAlarms`；
  `SafetyAlarmPanel`、`FireAlarmListDialog` watch 该信号重载列表。

## 非目标

- 不改非消防报警（周界/设施等）详情行为——无 `fireAlarmId` 时走原内存态路径。
- 不持久化「处置情况文本/时间/派单人员/通知方式」（后端现无对应列，保持会话态）。

## 影响面

- 改 `src/services/alarm.ts`、`src/screen/lib/data/mock.ts`、`src/screen/lib/adapters/alarmAdapter.ts`、
  `src/screen/lib/data/alarmDetailMock.ts`、`src/screen/lib/composables/useScreenAlarmFeed.ts`、
  `src/screen/components/common/AlarmDetailPanel.vue`、`.../FireAlarmListDialog.vue`、`.../panels/SafetyAlarmPanel.vue`，及对应用例。
- 契约同步：消费已存在的 `docs/api/fire-alarm.openapi.json`（同交付内由后端 Change 补齐该 path）。
- 回退：删除 `updateFireAlarm` 调用即恢复内存态；无持久化副作用。

## Capabilities

- `fire-alarm`（消防报警）：前端接入「报警处置写回」。
