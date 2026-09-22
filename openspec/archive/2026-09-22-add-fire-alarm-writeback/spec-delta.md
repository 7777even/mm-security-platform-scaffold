# Spec Delta: add-fire-alarm-writeback（前端）

## Capability: fire-alarm（消防报警 · 大屏/管理端）

### ADDED — 处置状态写回

- 详情面板 SHALL 在消防报警（`AlarmDetailItem.fireAlarmId` 非空）的状态流转（确认/开始处置/提交处置/标记误报/误报单选）时，
  调用 `PUT /fire-alarms/{alarmId}` 落库。
- 写回 SHALL 先于本地状态变更：失败时 SHALL 保持原状态并提示，不得产生「界面已变更但未落库」。
- 写回成功 SHALL 触发列表（SafetyAlarmPanel / FireAlarmListDialog）与声光报警源重新拉取。
- 非消防报警（无 `fireAlarmId`）SHALL 保持既有内存态行为不变。

### MODIFIED — 状态映射

- `fireListItemToDetail` SHALL 将后端 `status` 全量映射为详情中文态：
  `ACTIVE`→未确认、`ACKED`→已确认、`DISPATCHED`→处理中、`CLOSED`→已处理（原实现仅区分 CLOSED，已修正）。
- `falseAlarm` SHALL 在 `是/否/未核实` 间如实映射（原实现把「否」误降级为「未核实」，已修正）。

#### Scenario: 确认消防报警落库

- **GIVEN** 详情来自 `fireListItemToDetail`（携带 `fireAlarmId=FA-...`）、当前状态「未确认」
- **WHEN** 点击「确认」
- **THEN** 发出 `PUT /fire-alarms/FA-...`（`{"status":"ACKED"}`）；成功后本地变「已确认」、写入操作日志，并刷新列表；失败则维持「未确认」并提示

#### Scenario: 详情状态与后端一致

- **GIVEN** 后端该报警 `status=DISPATCHED`
- **WHEN** 打开其详情
- **THEN** 详情状态显示「处理中」（而非「未确认」）
