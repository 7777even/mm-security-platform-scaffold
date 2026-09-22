# Proposal: fire-alarm-disposal-persist（前端）

## 背景

后端 `2026-09-22-add-fire-alarm-writeback` 已把消防报警 `status`/`falseAlarm` 落库；本 Change 对应后端
`2026-09-22-fire-alarm-disposal-persist`，把详情面板里 4 个处置字段也一并持久化（原 writeback 提案列为非目标，
用户于 09-22 明确要求"一并持久化"）。

## 目标

- 契约 `docs/api/fire-alarm.openapi.json`：`FireAlarmUpdateRequest` 与 `FireAlarmItem` 各加 4 字段
  （`handleResult` / `handleTime` / `dispatchPersonnel` / `notifyMethod`），满足契约四铁律。
- `src/services/alarm.ts`：手写的 `FireAlarmItem` 接口与 `FireAlarmUpdatePayload` 加 4 字段；`updateFireAlarm` mock 合并。
- `src/screen/lib/data/alarmDetailMock.ts`：`fireListItemToDetail` 从 `FireAlarmItem` 回填 4 字段
  （逗号串→数组、APP/SMS→布尔），保证列表→详情往返不丢处置信息。
- `src/screen/components/common/AlarmDetailPanel.vue`：`persistFireAlarm` 扩展为在状态/误报变更之外，
  也能在**派单人员增删 / 通知方式切换 / 处置文本失焦 / 提交处置**时把 4 字段写回 `PUT /fire-alarms/{alarmId}`。

## 非目标

- 不新增接口、不改权限、不改乐观锁（沿用 `fire-alarm:ack` / `fire-alarm.alarm`）。
- 不改动 `fireAlarmToDetail`（screen AlarmItem 源无处置字段，保持内存态默认值）。

## 影响面

- 仅大屏告警详情面板与消防报警契约；向后兼容（4 字段均为可选）。
- 写回失败仍 `showToast` 并中止本地态流转（沿用既有策略）。

## Capabilities

- `fire-alarm`（消防报警）：前端处置字段写回能力补齐。
