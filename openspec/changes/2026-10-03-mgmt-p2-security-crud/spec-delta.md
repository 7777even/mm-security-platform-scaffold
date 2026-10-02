# Spec Delta: 安防检索与周界告警 CRUD 契约四同步

## Capability: security（安全防恐，前端契约层）

### ADDED — 人员识别检索写端点契约

- 契约 SHALL 在 `/security/search/person` 下同时声明 `get` 与 `post`（operationId `createPersonSearch`），
  在 `/security/search/person/{id}` 下同时声明 `get`、`put`（`updatePersonSearch`）、`delete`（`deletePersonSearch`）。
- 契约 SHALL 提供 `PersonSearchWriteRequest` schema，含 13 个字段且每个字段带中文 description 与 example，
  `required` 含 `name`。
- 三个写端点的 description SHALL 注明权限码 `security:person-write`、广播域 `security.person-search` 与必填项 `name`。

### ADDED — 车辆识别检索写端点契约

- 契约 SHALL 在 `/security/search/vehicle` 下声明 `get` + `post`（`createVehicleSearch`），
  在 `/security/search/vehicle/{id}` 下声明 `get` + `put`（`updateVehicleSearch`）+ `delete`（`deleteVehicleSearch`）。
- 契约 SHALL 提供 `VehicleSearchWriteRequest` schema，含 15 个字段，
  其中 `confidence` 类型必须为 `integer`（对齐后端 `Integer`，`nullable: true`），`required` 含 `plate`。
- 三个写端点的 description SHALL 注明权限码 `security:vehicle-write`、广播域 `security.vehicle-search` 与必填项 `plate`。

### ADDED — 周界告警删除契约

- 契约 SHALL 在 `/security/perimeter-alarms/{id}` 下与 `get`/`put` 并列声明 `delete`（`deletePerimeterAlarm`），
  description 注明权限码 `security:perimeter-delete` 与广播域 `security.perimeter-alarm`，200 响应 example 为 `data: null`。

### CHANGED — 应急三域写端点路径补 `{id}`

- `PUT/DELETE /emergency/{cases,knowledge,phones}` SHALL 声明在带 `{id}` 占位符的 path key 上，
  与后端实现及前端 service 调用一致，使跨库守门路由差异为 0。

#### Scenario: 生成类型可用

- **WHEN** 执行 `npm run gen:api-types`
- **THEN** `src/types/generated/security.ts` SHALL 含 7 个新 operation 与 2 个新 schema，且 `type-check` 不报错

#### Scenario: 跨库守门零差异

- **GIVEN** 契约已更新且后端已实现 7 个写端点
- **WHEN** 执行 `node backend-scaffold/scripts/check-api-contract.mjs --strict`
- **THEN** 路由差异 SHALL 为 0、schema 漂移 SHALL 为 0

#### Scenario: 字段类型漂移被拦截

- **WHEN** 把 `VehicleSearchWriteRequest.confidence` 写成 `string`
- **THEN** 守门脚本 SHALL 报「类型不一致 confidence:string≠integer」并以退出码 1 失败
