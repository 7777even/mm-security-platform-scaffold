# Spec Delta: production-alarm-writeback

## Capability: production-alarm（前端生产报警处置与实时刷新）

### ADDED — 生产报警前端处置写回与实时刷新

- 契约 `docs/api/production.openapi.json` SHALL 新增 `PUT /production/alarms/{id}` 路径与 `ProductionAlarmUpdateRequest` schema（四铁律齐备：按域分组 / 接口注释 / 字段中文 description / example）；`ProductionAlarmItem` status 字典 SHALL 含 `已确认` 并增 5 个回填字段。
- `npm run gen:api-types` SHALL 重新生成 `src/types/generated/production.ts`（含 update 路径类型）。
- `services/production.ts` SHALL 新增 `updateProductionAlarm(id, payload)`（镜像 `updateFireAlarm`：离线显式报错、返回更新后详情）+ `productionAlarmChanged` ref 与 `touchProductionAlarmChanged()` 同端刷新信号。
- `AlarmDetailItem` SHALL 增 `productionAlarmId?: number`，`productionAlarmToDetail` 写入该 id，`mapDetailStatusToProduction` 将详情态（`未确认/已确认/处理中/已处理`）映射回后端字典（`未处置/已确认/处置中/已处置`）。
- `AlarmDetailPanel.vue` SHALL 的 `persistAlarm` 分发器新增 `productionAlarmId` 分支 `persistProductionAlarm`，成功 `touchProductionAlarmChanged()`。
- `ProductionAlarmPanel.vue` 与 `ProductionAreaView.vue` SHALL 订阅 `subscribeDomainChange('production.alarm')` 并 `watch(productionAlarmChanged)` 实时刷新，`onUnmounted` 退订。

#### Scenario: 生产报警处置落库

- **GIVEN** 详情面板打开一条 `productionAlarmId` 存在的生产报警
- **WHEN** 点击「确认」触发 `persistAlarm({status:'已确认'})`
- **THEN** 经 `mapDetailStatusToProduction` 映射为 `已确认` 调用 `updateProductionAlarm`，成功后 `touchProductionAlarmChanged()`，`ProductionAlarmPanel` / `ProductionAreaView` 实时刷新

#### Scenario: 纯内存态告警放行

- **GIVEN** 一条无 `fireAlarmId` / `perimeterAlarmId` / `productionAlarmId` 的演示告警
- **WHEN** 触发处置动作
- **THEN** `persistAlarm` 三分支均不命中，直接放行不报错
