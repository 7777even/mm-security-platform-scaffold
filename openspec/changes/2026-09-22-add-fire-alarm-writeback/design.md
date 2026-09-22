# Design: add-fire-alarm-writeback（前端）

## 数据流

```
AlarmDetailPanel 按钮/单选
  └─(await) persistFireAlarm({status|falseAlarm})
        ├─ 无 fireAlarmId → 放行（非消防报警，保持内存态）
        └─ 有 fireAlarmId → updateFireAlarm(id, payload)   // PUT /fire-alarms/{id}
              ├─ 成功 → touchFireAlarmChanged()  → 列表/卡片/声光源 watch 重载
              └─ 失败 → showToast('状态写回失败…') → 中止本地流转
  成功后再 patchAlarmDetail(本地态) + pushTimeline(操作日志)
```

## 关键决策

- **先落库后改本地态**：避免「界面显示已确认但库没写」的不一致；失败即中止，不产生假成功。
- **真实主键贯穿**：`toScreenAlarmFromFire` 保留 `alarmId`→`AlarmItem.fireAlarmId`，
  `fireAlarmToDetail`/`fireListItemToDetail` 透传至 `AlarmDetailItem.fireAlarmId`；
  以「是否有 fireAlarmId」判定是否消防报警，**不靠 id 前缀猜**（`fire-{num}` 会丢真实编号）。
- **状态映射**：正映射 `mapFireStatusToDetail`（后端→详情）留在 `lib/data/alarmDetailMock`（供各详情工厂复用）；
  反映射 `mapDetailStatusToFire`（详情→后端）**就地实现在组件内**——因 `gate:screen` 禁止大屏组件值导入
  `lib/data` 业务函数（实测报 `AlarmDetailPanel.vue ← alarmDetailMock#mapDetailStatusToFire`）。
  两者共同替换原先「非 CLOSED 一律未确认」的丢态写法。
- **刷新走模块级信号**：`fireAlarmChanged`（ref 计数）替代事件总线；`useScreenAlarmFeed` 内部
  watch 重载 `screenFireAlarms`，`SafetyAlarmPanel`/`FireAlarmListDialog` 各自 watch 重载本列表。

## 契约

- 消费 `docs/api/fire-alarm.openapi.json#/paths/~1fire-alarms~1{alarmId}/put`（`FireAlarmUpdateRequest`）。
- `FireAlarmItem.status` 类型 `AlarmStatus`（ACTIVE/ACKED/DISPATCHED/CLOSED）已在 `services/alarm.ts` 定义，复用。
