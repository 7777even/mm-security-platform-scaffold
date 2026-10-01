# Spec Delta: fire-alarm-crud

## Capability: fire-alarm-crud（前端）

### ADDED — 管理端报警新增 / 编辑

- 系统 SHALL 在管理端「消防报警记录」页提供「新增」入口，打开 `FireAlarmEditDialog` 全字段表单。
- 对话框 SHALL 对 `title` / `time` 做必填校验，缺失不允许提交。
- 提交新增时 SHALL 调用 `createFireAlarm(payload)`（`POST /fire-alarms`）；编辑态 SHALL 调用
  `updateFireAlarm(alarmId, payload)`（`PUT /fire-alarms/{alarmId}` 全字段）。
- 新增 / 编辑成功 SHALL 刷新列表并关闭对话框。

### ADDED — 管理端报警删除

- 列表行 SHALL 提供「删除」操作，二次确认（`ElMessageBox.confirm`）后调用 `deleteFireAlarm(alarmId)`
  （`DELETE /fire-alarms/{alarmId}` 真删除），成功刷新列表。

### ADDED — 三端实时订阅

- 管理端列表 SHALL 在挂载时 `subscribeDomainChange('fire-alarm.alarm', load)`，卸载时退订；
  收到 `fire-alarm.alarm.changed` 后自动重拉列表。
- 大屏 `/fire`（`FireMonitoring.vue`）SHALL 订阅同一域，收到变更后调用 `refreshScreenFireAlarms`
  重拉消防报警展示点，使后台增删改联动大屏自动出现 / 消失。

#### Scenario: 后台新增联动大屏

- **GIVEN** 管理端与大屏同时打开
- **WHEN** 在管理端新增一条消防报警
- **THEN** 后端广播 `fire-alarm.alarm.changed`，大屏在去抖后自动出现该条报警点位，列表也自动出现

#### Scenario: 后台删除联动两端

- **GIVEN** 一条 `alarmId=FA-x` 的报警同时存在于两端
- **WHEN** 在管理端删除 `FA-x`
- **THEN** 两端均经 WS 重拉后该条消失（列表与大屏）

#### Scenario: 编辑必填校验

- **WHEN** 在对话框内清空 `title` 并提交
- **THEN** 表单校验失败，不调用 `createFireAlarm` / `updateFireAlarm`
