# Tasks: add-fire-alarm-writeback（前端）

- [x] [TDD] 修正/补齐 `AlarmDetailPanel.spec.ts`：状态流转改异步后 `clickByText` 冲刷微任务（`flushPromises`），
      断言 确认/开始处置/提交处置/标记误报 仍写入本地态。
- [x] `services/alarm.ts` 新增 `FireAlarmUpdatePayload` 与 `updateFireAlarm(alarmId, payload)`。
- [x] `screen AlarmItem` 增加可选 `fireAlarmId`；`toScreenAlarmFromFire` 携带真实 `alarmId`。
- [x] `AlarmDetailItem` 增加 `fireAlarmId`；`fireAlarmToDetail` / `fireListItemToDetail` 填充；
      新增 `mapFireStatusToDetail`（lib/data，供工厂复用）并替换丢态映射。
- [x] `AlarmDetailPanel`：`persistFireAlarm` 统一写回（先落库后改本地态、失败中止并提示），
      接入 确认/开始处置/提交处置/标记误报/误报单选 五处；成功后 `touchFireAlarmChanged`。
      反映射 `mapDetailStatusToFire` **就地实现在组件内**（`gate:screen` 禁组件值导入 lib/data 业务函数）。
- [x] `useScreenAlarmFeed` 增加 `fireAlarmChanged` / `touchFireAlarmChanged` / `reloadScreenFireAlarms` 并订阅重载声光报警源。
- [x] `SafetyAlarmPanel`、`FireAlarmListDialog` watch `fireAlarmChanged` 重载列表。
- [x] `npm run gate:screen` 通过（PASS — 白名单外本地业务数据零引用）。
- [x] `npm run type-check` 通过（vue-tsc EXIT=0）。
- [x] `SUBAPP_NO_EMPTY=1 SUBAPP=fm-fire npm run build:subapps` 通过（fm-fire 产物更新）。
- [x] `AlarmDetailPanel.spec.ts` 10/10 通过；改动 9 文件 eslint 通过。
- [x] 真机联调：确认一条消防报警后刷新列表，状态保持「已确认」（已验证：确认后 status=ACKED 落库）。
