# Spec Delta: 道闸与防恐柱台账 CRUD 契约四同步与前端消费层

## Capability: security（安全防恐，前端契约层 + 消费层）

### ADDED — 道闸写端点契约

- 契约 SHALL 在 `/security/gate-controls` 下同时声明 `get` 与 `post`（`createGateControl`），在 `/security/gate-controls/{id}` 下声明 `get` + `put`（`updateGateControl`）+ `delete`（`deleteGateControl`）。
- 契约 SHALL 提供 `GateControlWriteRequest` schema，`required` 含 `name`，**不得声明 `status` 字段**（零下行控制）。
- 写端点 description SHALL 注明权限码 `security:gate-write` 与广播域 `security.gate-control`。

### ADDED — 防恐柱写端点契约

- 契约 SHALL 在 `/security/bollards` 下声明 `get` + `post`（`createBollard`），在 `/security/bollards/{id}` 下声明 `get` + `put`（`updateBollard`）+ `delete`（`deleteBollard`）。
- 契约 SHALL 提供 `BollardWriteRequest` schema，`required` 含 `name`，**不得声明 `status` 字段**。
- 写端点 description SHALL 注明权限码 `security:bollard-write` 与广播域 `security.bollard`。

### ADDED — 管理端 CRUD 消费层

- 管理端道闸/防恐柱视图 SHALL 提供新增/编辑对话框（`MgmtRecordEditDialog` 范式）与操作列（编辑/删除），删除须二次确认。
- 视图 SHALL 通过 `useDomainAutoRefresh` 订阅 `security.gate-control` / `security.bollard`，任一端写操作后自动重拉。

### ADDED — 大屏实时联动

- 大屏道闸/防恐柱列表面板 SHALL 订阅 `security.gate-control` / `security.bollard`，任一端改台账后自动重拉，实现三端同源实时刷新。

#### Scenario: 生成类型可用

- **WHEN** 执行 `npm run gen:api-types`
- **THEN** `src/types/generated/security.ts` SHALL 含 6 个新 operation 与 2 个新 schema，且 `type-check` 不报错

#### Scenario: 跨库守门零差异

- **GIVEN** 契约已更新且后端已实现 6 个写端点
- **WHEN** 执行 `node backend-scaffold/scripts/check-api-contract.mjs --strict`
- **THEN** 路由差异 SHALL 为 0、schema 漂移 SHALL 为 0

#### Scenario: 零下行控制（前端）

- **WHEN** 管理端提交道闸/防恐柱写请求
- **THEN** 请求体 MUST NOT 含 `status`（由 `MgmtRecordEditDialog` 的 FIELDS 白名单保证），设备实时状态不被覆盖
