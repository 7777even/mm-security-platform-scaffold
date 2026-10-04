# Proposal: 消防设施台账与防火巡查 CRUD 契约四同步与前端消费层（P2 批次 3）

## Why

后端已在 `feature/mgmt-p2-fire-facility-patrol`（V99/V102 + 服务/控制器写端点）落地消防设施台账与防火巡查记录的全套 CRUD。前端契约 `docs/api/fire-facility.openapi.json` 与 `docs/api/fire-monitoring.openapi.json` 已补 `/ledger` 与 `/patrols` 的写端点与 `FireFacilityLedgerWriteRequest` / `FirePatrolWriteRequest` schema，但**前端消费层尚未完全接入**：

1. `FireFacilityLedgerView.vue` 已升级为全量 CRUD（MgmtRecordEditDialog + 操作列 + 订阅），但 `PatrolView.vue` 仍是只读列表，防火巡查记录无法在前端新增/编辑/删除。
2. `src/services/fireMonitoring.ts` 缺 `createFirePatrol` / `updateFirePatrol` / `deleteFirePatrol` 三个写函数封装。
3. 写请求若接受设备实时状态字段会突破零下行控制红线。

契约是唯一真源（后端不得复制第二份 OpenAPI），本次把**契约真源、生成类型、管理端 PatrolView CRUD 消费层**补齐，并由 `check-api-contract.mjs --strict` 完成跨库守门。

## What Changes

- `docs/api/fire-facility.openapi.json`：新增 3 个写端点（operationId `createLedger` / `updateLedger` / `deleteLedger`），同 path 多 method 合并到同一 path key；新增 schema `FireFacilityLedgerWriteRequest`（设施编码/名称/类型必填，无 `status` 字段）。
- `docs/api/fire-monitoring.openapi.json`：新增 3 个写端点（operationId `createFirePatrol` / `updateFirePatrol` / `deleteFirePatrol`），合并到 `/patrols` path key；新增 schema `FirePatrolWriteRequest`（巡查日期必填，无 `status` 字段）。
- 重跑 `npm run gen:api-types`：`src/types/generated/fire-facility.ts` / `fire-monitoring.ts` 产出对应 operation 与 schema。
- `src/services/fireFacility.ts`：新增 `createFireFacilityLedger` / `updateFireFacilityLedger` / `deleteFireFacilityLedger`（三态语义：demo/offline/live 降级）。
- `src/services/fireMonitoring.ts`：新增本地 `FirePatrolWriteRequest` 接口与 `createFirePatrol` / `updateFirePatrol` / `deleteFirePatrol`（三态降级）。
- `apps/mgmt/views/fire/PatrolView.vue`：由只读列表升级为全量 CRUD——`MgmtRecordEditDialog` 标准范式 + 操作列（编辑/删除二次确认，`v-permission` 门禁 `fire:patrol-write`）+ `useDomainAutoRefresh` 订阅 `fire.patrol-record`。列表返回全量字段，编辑直接以行数据回填，不额外取详情。
- `apps/mgmt/views/fire/PatrolView.vue` 的 `locations`（部位列表）在前端以逗号/顿号分隔的文本录入，保存时拆分为 `string[]` 落库，严守白名单。

## Capabilities

- `fire-facility`（消防设施，契约层 + 消费层）：新增「消防设施台账 CRUD」的机器可读契约、TS 类型与管理端消费层。
- `fire-monitoring`（消防监控，契约层 + 消费层）：新增「防火巡查记录 CRUD」的机器可读契约、TS 类型与管理端消费层。

## Impact

- 影响：`docs/api/fire-facility.openapi.json`、`docs/api/fire-monitoring.openapi.json`、`src/types/generated/fire-facility.ts`、`src/types/generated/fire-monitoring.ts`、`src/services/fireFacility.ts`、`src/services/fireMonitoring.ts`、`apps/mgmt/views/fire/FireFacilityLedgerView.vue`、`apps/mgmt/views/fire/PatrolView.vue`。
- 风险：写请求体不含 `status`，由 `MgmtRecordEditDialog` 的 FIELDS 白名单保证（`status` 不在字段清单内，提交 payload 永不含该字段），守住零下行控制红线。

## 非目标 / 后续

- 大屏（screen）对 `fire-facility.ledger` / `fire.patrol-record` 的实时订阅本轮**暂不接入**：screen 通过 `FireFacilityMonitoringDialog` / `FirePatrolDialog` 按需弹窗消费台账数据，而非常驻面板；其订阅接线作为独立 follow-up 处理。
- 维保工单（`FireFacilityMaintenanceView`）不在本批次：后端无对应写端点（此前因触碰 V99 推迟），留待后续批次。
