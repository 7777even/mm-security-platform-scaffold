# Spec Delta: 消防设施台账与防火巡查 CRUD（P2 批次 3）

## Capability: fire-facility（消防设施台账）

### ADDED — 台账新增 / 编辑 / 删除

- 前端 SHALL 通过 `createFireFacilityLedger` 调 `POST /api/v1/fire-facility/ledger` 新增台账（设施编码/名称/类型必填）。
- 前端 SHALL 通过 `updateFireFacilityLedger(id, payload)` 调 `PUT /api/v1/fire-facility/ledger/{id}` 编辑。
- 前端 SHALL 通过 `deleteFireFacilityLedger(id)` 调 `DELETE /api/v1/fire-facility/ledger/{id}`（二次确认后删除）。
- 写成功后 SHALL 重拉 `fire-facility.ledger` 域（订阅自动刷新）。

### ADDED — 零下行控制

- 台账写请求 SHALL 不含 `status` 字段；`status` 为设备实时状态，仅读不写，系统 MUST NOT 接受对 `status` 的写回。

## Capability: fire-monitoring（防火巡查记录）

### ADDED — 巡查记录新增 / 编辑 / 删除

- 前端 SHALL 通过 `createFirePatrol` 调 `POST /api/v1/fire/patrols` 新增巡查记录（巡查日期必填）。
- 前端 SHALL 通过 `updateFirePatrol(id, payload)` 调 `PUT /api/v1/fire/patrols/{id}` 编辑。
- 前端 SHALL 通过 `deleteFirePatrol(id)` 调 `DELETE /api/v1/fire/patrols/{id}`（二次确认后删除）。
- 写成功后 SHALL 重拉 `fire.patrol-record` 域。

### ADDED — 部位列表录入

- `locations`（部位列表）在前端 SHALL 以逗号/顿号分隔文本录入，`onSave` 拆分为 `string[]` 提交，落库逗号拼接。

### ADDED — 零下行控制

- 巡查写请求 SHALL 不含 `status` 字段；检查项结果（`checkItems`）本轮只读，不在写请求白名单内。

#### Scenario: 台账新增广播

- **GIVEN** 操作员具备 `fire-facility:ledger:write`
- **WHEN** 提交新增（`facilityCode="F001"`、`facilityName="消防水泵"`、`facilityType="消防水泵"`）
- **THEN** 落库返回带主键的台账条目，并广播 `fire-facility.ledger.changed`，管理端列表自动刷新

#### Scenario: 巡查新增 locations 拆分

- **GIVEN** 操作员具备 `fire:patrol-write`
- **WHEN** 提交新增（巡查日期 `2026-10-03`、`locations="A区、B区、C区"`）
- **THEN** 提交 payload 的 `locations` 为 `["A区","B区","C区"]`，落库逗号拼接

#### Scenario: 零下行控制

- **WHEN** 任何台账/巡查写请求携带 `status` 字段
- **THEN** 该字段 MUST 被忽略（不在 FIELDS/DTO 内），设备实时状态不被覆盖
