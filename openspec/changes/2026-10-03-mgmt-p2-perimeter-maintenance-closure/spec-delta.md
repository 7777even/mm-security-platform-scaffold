# Spec Delta: 周界告警 CRUD 闭环 + 设施报警改接对源 + 维保子写端点

## Capability: security（安全防恐，前端契约层）

### ADDED — 周界入侵告警 LIST 契约

- 契约 SHALL 在 `/security/perimeter-alarms` 下声明 `get`（`listPerimeterAlarms`），200 响应 example 为
  `data=PerimeterAlarmDetail[]`（数组）；`PerimeterAlarmDetail` schema 已存在（32 字段，含中文 description）。

### CHANGED — 周界告警管理端消费层

- 管理端 SHALL 提供 `/perimeter-alarm-mgmt` 页面（列表 + 新增 + 处置写回 + 删除），
  新增受 `security:perimeter-create`、处置受 `security:perimeter-ack`、删除受 `security:perimeter-delete` 控制，
  订阅 `security.perimeter-alarm` 实时刷新。

## Capability: fire-facility（消防设施，前端契约层）

### ADDED — 维保子写请求 schema

- 契约 SHALL 提供 `FireFacilityMaintenanceWriteRequest` schema（`date`/`content` 必填，`reportFile` 可空，
  字段带中文 description + example）。

### CHANGED — 维保记录 schema 携带主键

- `FireFacilityMaintenanceRecord` SHALL 增加 `id`（记录主键）/ `ledgerId`（所属台账 id）字段，供前端单独删除引用。

### ADDED — 维保子写端点契约

- 契约 SHALL 在 `/fire-facility/ledger/{ledgerId}/maintenance` 声明 `post`（`createFireFacilityMaintenance`），
  在 `/fire-facility/maintenance/{recordId}` 声明 `delete`（`deleteFireFacilityMaintenance`）；
  description 注明权限码 `fire-facility:ledger:write` 与广播域 `fire-facility.ledger`，删除 example 为 `data: null`。

### CHANGED — 设施报警改接对源

- 管理端 `FireFacilityAlarmView` SHALL 读 `/fire-facility/alarms`（与大屏同源，由故障派生），而非 `/fire-alarms`；
  订阅 `fire-facility.fault` 广播自动重拉。

#### Scenario: 生成类型可用

- **WHEN** 执行 `npm run gen:api-types`
- **THEN** `src/types/generated/security.ts` SHALL 含 `listPerimeterAlarms` operation；
  `src/types/generated/fire-facility.ts` SHALL 含 `createMaintenance`/`deleteMaintenance` operation 与
  `FireFacilityMaintenanceWriteRequest` schema，`type-check` 不报错

#### Scenario: 跨库守门零新增漂移

- **GIVEN** 契约已更新且后端已实现 LIST/维保子写端点
- **WHEN** 执行 `node backend-scaffold/scripts/check-api-contract.mjs --strict`
- **THEN** schema 漂移 SHALL 为 0；本次新增路由 SHALL 全部落入「已对齐」集合（存量 12 差异为 gate/bollard/patrol 技术债）

#### Scenario: 周界台账可处置销条

- **WHEN** 在 `/perimeter-alarm-mgmt` 点击某条告警的「处置」
- **THEN** 写回 `PUT /security/perimeter-alarms/{id}` 后，列表经 `security.perimeter-alarm` 订阅自动重拉且状态更新
