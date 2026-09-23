# Design: production-alarm-writeback（前端）

## 数据流

```
详情面板「确认 / 开始处置 / 提交处置 / 误报标记 / 派单人员 / 通知方式 / 处置情况」
  └─ persistAlarm(partial) 分发器
       ├─ fireAlarmId 存在          → persistFireAlarm       (PUT /fire-alarms/{id})
       ├─ perimeterAlarmId 存在     → persistPerimeterAlarm  (PUT /security/perimeter-alarms/{id})
       ├─ productionAlarmId 存在    → persistProductionAlarm (PUT /production/alarms/{id})   ← 本次新增
       └─ 均无                      → 直接放行（纯内存态演示告警）

persistProductionAlarm:
  payload.status = mapDetailStatusToProduction(partial.status)   // 详情态→后端中文字典
  payload.falseAlarm / handleResult / handleTime = partial.*
  payload.dispatchPersonnel = partial.dispatchPersonnel.join(',')
  payload.notifyMethod = [APP?, SMS?].join(',')                  // 由 notifyApp/notifySms 布尔合并
  await updateProductionAlarm(productionAlarmId, payload)
  touchProductionAlarmChanged()                                  // 同端即时刷新信号
  // 后端 @RealtimeSync 同时广播 production.alarm.changed → 跨端 / 跨标签经 subscribeDomainChange 去抖刷新
```

## 关键决策

- **复用中央面板统一分发器**：不新增独立面板，仅在 `AlarmDetailPanel.persistAlarm` 增加 `productionAlarmId` 分支，与消防 / 周界同源范式，避免三套写回逻辑发散。
- **状态字典双向映射**：详情面板统一展示态为 `未确认/已确认/处理中/已处理`；生产后端字典为 `未处置/已确认/处置中/已处置`。`mapDetailStatusToProduction` 写回时映射（`已确认→已确认`、`处理中→处置中`、`已处理→已处置`、`未确认→未处置`）；`productionAlarmToDetail` 打开时反向映射回填。新增「已确认」态是生产域相对原 KPI 三态的扩展，须前后端字典一致，否则后端 `PARAM_INVALID` 拒。
- **通知方式合并**：详情面板用 `notifyApp` / `notifySms` 布尔，写回时合并为 `APP,SMS` 逗号串（对齐后端 `ProductionAlarmUpdateRequest.notifyMethod`），打开时再 `split(',')` 还原。
- **双链路实时刷新**：写回成功后 `touchProductionAlarmChanged()` 触发同端 `ProductionAlarmPanel` / `ProductionAreaView` 立即重拉；同时后端 ws 广播 `production.alarm.changed`，其他端 / 标签页经 `subscribeDomainChange('production.alarm')` 去抖刷新。两条链路互不冲突。
- **离线显式报错**：`updateProductionAlarm` 在未配置 `VITE_API_BASE` 时显式 `backendUnavailableWarn` 并抛错，绝不静默回落假数据；写回失败 `showToast('处置信息写回失败，请稍后重试')` 并回 false，由调用方中止本地状态流转（与消防 / 周界一致）。
- **契约四同步**：后端实现 → 契约 `production.openapi.json` → `gen:api-types` 重新生成 `src/types/generated/production.ts` → 前端手写的 `services/production.ts` 同步增字段与函数；`check-api-contract.mjs --strict` 0 漂移。
