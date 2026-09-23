# Spec Delta: perimeter-alarm-writeback

## Capability: security-perimeter（前端周界告警处置与实时刷新）

### ADDED — 周界告警前端处置写回与实时刷新

- 契约 `docs/api/security.openapi.json` SHALL 新增 `PUT /security/perimeter-alarms/{id}` 路径与 `PerimeterAlarmUpdateRequest` schema（四铁律齐备：按域分组 / 接口注释 / 字段中文 description / example）。
- `npm run gen:api-types` SHALL 重新生成 `src/types/generated/security.ts`（含 update 路径类型）。
- `services/security.ts` SHALL 新增 `updatePerimeterAlarm(id, payload)`（镜像 `updateFireAlarm`：离线显式报错、返回更新后详情）+ `perimeterAlarmChanged` ref 与 `touchPerimeterAlarmChanged()` 同端刷新信号。
- `AlarmDetailPanel.vue` SHALL 将原 `persistFireAlarm` 收敛为统一 `persistAlarm` 分发器，按 `fireAlarmId` / `perimeterAlarmId` 分支到消防或周界写回；周界写回成功 `touchPerimeterAlarmChanged()`。
- `SecurityStatusPanel.vue` SHALL 订阅 `subscribeDomainChange('security.perimeter-alarm')` 并 `watch(perimeterAlarmChanged)` 实时刷新，`onUnmounted` 退订。
- `alarmDetailMock.ts` 的 `AlarmDetailItem` SHALL 增 `perimeterAlarmId?: number`，`perimeterAlarmToDetail` 写入该 id，`normalizePerimeterStatus` 兼容 `已派单` → 详情态 `处理中`，写回经 `mapDetailStatusToPerimeter` 映射回。

#### Scenario: 周界告警处置落库

- **GIVEN** 详情面板打开一条 `perimeterAlarmId` 存在的周界告警
- **WHEN** 点击「确认」触发 `persistAlarm({status:'处理中'})`
- **THEN** 经 `mapDetailStatusToPerimeter` 映射为 `已派单` 调用 `updatePerimeterAlarm`，成功后 `touchPerimeterAlarmChanged()`，`SecurityStatusPanel` 实时刷新

#### Scenario: 纯内存态告警放行

- **GIVEN** 一条无 `fireAlarmId` / `perimeterAlarmId` 的演示告警
- **WHEN** 触发处置动作
- **THEN** `persistAlarm` 两分支均不命中，直接放行不报错
