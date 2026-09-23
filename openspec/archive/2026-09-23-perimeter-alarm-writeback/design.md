# Design: perimeter-alarm-writeback（前端）

## 数据流

```
AlarmDetailPanel 处置动作（确认/派单/处置/误报/派单人员/通知/处置情况）
  └─ persistAlarm(partial) 分发器
       ├─ detail.fireAlarmId 存在 → persistFireAlarm（消防写回，映射 ACTIVE/ACKED/DISPATCHED/CLOSED）
       ├─ detail.perimeterAlarmId 存在 → persistPerimeterAlarm（周界写回）
       │     ├─ payload.status = mapDetailStatusToPerimeter(partial.status)  // 处理中 → 已派单
       │     ├─ payload.falseAlarm / handleResult / handleTime / dispatchPersonnel(,join) / notifyApp / notifySms
       │     ├─ updatePerimeterAlarm(id, payload)  PUT /security/perimeter-alarms/{id}
       │     └─ 成功 → touchPerimeterAlarmChanged()  // 同端即时刷新信号
       └─ 均无 → 直接放行（纯内存态演示告警）

SecurityStatusPanel（周界面板）
  onMounted
    ├─ loadPerimeterAlarm()
    └─ subscribeDomainChange('security.perimeter-alarm', () => loadPerimeterAlarm())  // 跨端/跨标签 ws 广播
  watch(perimeterAlarmChanged, () => loadPerimeterAlarm())  // 同端写回成功信号
  onUnmounted → unsubscribe()
```

## 关键决策

- **复用消防报警写回范式（镜像）**：`updatePerimeterAlarm` 与 `updateFireAlarm` 同源（离线显式报错、返回更新后详情、成功 touch 信号）；差异仅在 payload 形状——消防用 `notifyMethod` 字符串（`APP,SMS`），周界用 `notifyApp` / `notifySms` 双布尔（与后端 `PerimeterAlarmUpdateRequest` 对齐）。
- **统一分发器 `persistAlarm`**：9 个处置动作原各自调用 `persistFireAlarm`，现收敛为调用 `persistAlarm(partial)`，由主键归属分支，避免每处重复判断 `fireAlarmId` / `perimeterAlarmId`。消防分支保持原逻辑不动。
- **状态字典 seam**：后端周界状态字典是 `未确认/已确认/已派单/已处理`，而全 alarm 域详情态统一用 `处理中`（`normalizePerimeterStatus` 已把 `已派单` → `处理中` 展示）。写回时 `mapDetailStatusToPerimeter` 把 `处理中` 映射回 `已派单`，保证双向一致，不被后端 `PARAM_INVALID` 拒。
- **perimeterAlarmId 标注**：`perimeterAlarmToDetail` 现写入 `perimeterAlarmId: alarm.id`（`fac_perimeter_alarm.id` 为 Long，前端 number），作为详情面板判断是否走周界写回的唯一标记，与消防 `fireAlarmId` 平级。
- **实时双链路**：写回成功后 `touchPerimeterAlarmChanged()`（同端即时，无需等 ws 往返）+ `subscribeDomainChange('security.perimeter-alarm')`（跨端/跨标签经 `/ws/alarm` 广播）。两条路径都触发 `loadPerimeterAlarm`，幂等重拉，ws 未连通场景由 ref watch 兜底。
- **退订防泄漏**：`subscribeDomainChange` 返回退订函数，存 `unsubscribePerimeter`，在 `onUnmounted` 调用，避免面板卸载后监听器残留导致重复拉取/内存泄漏。

## 契约四同步

- `security.openapi.json` 是机器可读契约真源（四条铁律：按域分组 / 接口注释 / 字段中文 description / example）。
- `gen:api-types` 由 openapi 生成 `src/types/generated/security.ts`，新增 `updatePerimeterAlarm` 路径类型与 `PerimeterAlarmUpdateRequest` schema，前端 `updatePerimeterAlarm` 函数复用该生成类型。
