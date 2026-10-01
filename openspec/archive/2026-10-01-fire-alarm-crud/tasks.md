# Tasks: fire-alarm-crud（前端）

## 服务层（Task 8）

- [x] `src/services/alarm.ts` 新增 `FireAlarmEditPayload`（19 字段，title/time 必填）、`createFireAlarm` / `deleteFireAlarm`
- [x] `updateFireAlarm` 的 `FireAlarmUpdatePayload` 扩为 `FireAlarmEditPayload`（旧调用兼容），保留 devMock / offline 语义

## 管理端页面（Task 9）

- [ ] 新增 `apps/mgmt/components/FireAlarmEditDialog.vue`（新增 / 编辑共用，全字段表单，title/time 必填校验）
- [ ] 改 `apps/mgmt/views/alarm/AlarmRecordView.vue`：新增按钮 + 操作列（编辑 / 删除二次确认）
- [ ] 同一视图 `onMounted` 订阅 `fire-alarm.alarm`、卸载退订；补 `DISPATCHED`/`ACKED` 状态筛选

## 大屏联动（Task 10）

- [ ] 改 `src/screen/views/FireMonitoring.vue`：订阅 `fire-alarm.alarm.changed` → `refreshScreenFireAlarms`，`onUnmounted` 退订

## 测试与构建（Task 11）

- [x] `FireAlarmEditDialog.spec.ts`：mock create/update，断言新增走 create、编辑带 alarmId 走 update、校验失败不调用
- [x] `AlarmRecordView.spec.ts`：断言订阅注册 / 卸载、删除确认后调用 deleteFireAlarm
- [x] `npm run test:coverage` ≥ 80% 通过；`type-check` / `lint` / `gate:screen` 全绿；`build:subapps` 延至 Task 12（本次未改 wujie 子应用）

## 收尾（Task 12）

- [x] 双仓推送 `feature/scaffold-rebuild`（前后端）与三端联调验证（待本 Change 上列项全部完成后归档）
