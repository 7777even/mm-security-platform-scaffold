# Proposal: 安防检索与周界告警 CRUD 契约四同步（P2 批次 1）

## Why

后端已在 `feature/mgmt-p2-security-crud`（提交 956302f / 45c4cce / 2a2fe54）落地安防域 7 个写端点：
人员 / 车辆检索的 POST、PUT、DELETE，以及周界告警 DELETE。前端 `docs/api/security.openapi.json`
此前**只有只读端点**，`gen:api-types` 产出的 `security.ts` 无对应 operation 与写请求 schema，
管理端「人员登记 / 车辆登记」台账只能看、不能增删改，周界告警也无法销条。

契约是唯一真源（后端不得复制第二份 OpenAPI），本次先把**契约真源与生成类型**补齐，
为后续前端消费层（对话框 + 操作列 + 实时订阅）铺路，并由
`check-api-contract.mjs --strict` 完成跨库守门。

## What Changes

- `docs/api/security.openapi.json`：
  - 新增 7 个写端点，operationId 依次为 `createPersonSearch` / `updatePersonSearch` / `deletePersonSearch` /
    `createVehicleSearch` / `updateVehicleSearch` / `deleteVehicleSearch` / `deletePerimeterAlarm`。
  - **同 path 多 method 合并到同一 path key**：`/security/search/person/{id}`（get+put+delete）、
    `/security/search/vehicle/{id}`（get+put+delete）、`/security/search/person`（get+post）、
    `/security/search/vehicle`（get+post）、`/security/perimeter-alarms/{id}`（get+put+delete）。
  - 新增 schema `PersonSearchWriteRequest`（13 字段，`name` 必填）/ `VehicleSearchWriteRequest`
    （15 字段，`plate` 必填，`confidence` 为 integer 可空）。
  - description 注明权限码（`security:person-write` / `security:vehicle-write` / `security:perimeter-delete`）、
    `@RealtimeSync` 广播域（`security.person-search` / `security.vehicle-search` / `security.perimeter-alarm`）
    与必填项。
- 重跑 `npm run gen:api-types`：`src/types/generated/security.ts` 产出 7 个 operation 与 2 个 schema。
- 顺带修正存量契约漂移：`docs/api/emergency.openapi.json` 的 `PUT/DELETE /emergency/{cases,knowledge,phones}`
  缺 `{id}` 路径占位符（后端实现与前端 service 均为 `/{id}`），补上后守门脚本路由差异归零。

## Capabilities

- `security`（安全防恐，前端契约层）：新增「人员登记 / 车辆登记 CRUD 与周界告警删除」的机器可读契约与 TS 类型。

## Impact

- 影响：`docs/api/security.openapi.json`、`src/types/generated/security.ts`、
  `docs/api/emergency.openapi.json`、`src/types/generated/emergency.ts`。
- 风险：emergency 三域契约改路径 key 会影响其生成类型，但前端 `src/services/emergency*.ts`
  本就按 `/{id}` 拼 URL，无调用点变更；`type-check` 已验证无新增错误。
- 未涉及前端 UI 消费层（对话框 / 操作列 / 订阅），留在本 Change 的未勾选项中后续推进。
