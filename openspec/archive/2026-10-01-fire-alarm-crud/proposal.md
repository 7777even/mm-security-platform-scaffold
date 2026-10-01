# Proposal: fire-alarm-crud

## Why

管理后台「消防报警记录」页此前**只有查看**（只读表格 + 详情抽屉），没有新增 / 编辑 / 删除入口；
大屏 `/fire` 的消防报警展示点也只在前端 `load()` 时拉一次，后台增删改后**不会自动刷新**。

后端已具备全套 CRUD（`POST /fire-alarms`、`PUT /fire-alarms/{alarmId}` 全字段、`DELETE /fire-alarms/{alarmId}`，
均 `@RealtimeSync(domain="fire-alarm.alarm")`，见后端同日期 Change），契约已在 Task 6 四同步完成。
本提案补齐**前端消费层**：管理端 CRUD 对话框 + 操作列 + 实时订阅，大屏订阅域变更，打通三端实时联通。

## What Changes

- 服务层 `src/services/alarm.ts`：
  - 新增 `createFireAlarm(payload)` / `deleteFireAlarm(alarmId)`；`FireAlarmEditPayload` 对齐后端
    `FireAlarmCreateRequest` ∪ 全字段 `FireAlarmUpdateRequest`（19 字段，`title`/`time` 必填）。
  - 既有 `updateFireAlarm` 的 `FireAlarmUpdatePayload` 扩为 `FireAlarmEditPayload`（旧调用兼容）。
  - 离线语义：devMock 下 create 返回 `FA-MOCK-*` 假 id、delete 解析成功；`isAlarmOffline()` 显式报错。
- 新增 `apps/mgmt/components/FireAlarmEditDialog.vue`（新增 / 编辑共用，Element Plus 全字段表单，
  `title`/`time` 必填校验，props `modelValue`/`editRow`，emits `update:modelValue`/`saved`）。
- 改 `apps/mgmt/views/alarm/AlarmRecordView.vue`：顶部加「新增」按钮；`<MgmtProTable>` 加操作列
  （编辑 / 删除二次确认）；`onMounted` 内 `subscribeDomainChange('fire-alarm.alarm', load)`，`onUnmounted`
  退订；补状态筛选 `DISPATCHED`/`ACKED`。
- 改 `src/screen/views/FireMonitoring.vue`：复用已导入的 `refreshScreenFireAlarms`，
  `subscribeDomainChange('fire-alarm.alarm', () => refreshScreenFireAlarms())`，`onUnmounted` 退订。
- 测试：`__tests__/FireAlarmEditDialog.spec.ts`、`__tests__/AlarmRecordView.spec.ts`（MockMvc 模式的对等）。

## Capabilities

- `fire-alarm-crud`（前端：管理端消防报警新增 / 编辑 / 删除 + 三端实时订阅）

## Impact

- 影响：`src/services/alarm.ts`、`apps/mgmt/components/FireAlarmEditDialog.vue`（新）、
  `apps/mgmt/views/alarm/AlarmRecordView.vue`、`src/screen/views/FireMonitoring.vue`、
  `__tests__/*` 两个新文件。
- 风险：mgmt 是独立入口（非 wujie 子应用），弹窗无 `Teleport to="body"` 限制，可直接用 `<el-dialog>`；
  大屏订阅须与既有 `fireAlarmChanged` 本地信号链路共存，不重复触发。
