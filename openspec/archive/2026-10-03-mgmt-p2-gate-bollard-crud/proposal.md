# Proposal: 道闸与防恐柱台账 CRUD 契约四同步与前端消费层（P2 批次 2）

## Why

后端已在 `feature/mgmt-p2-gate-bollard`（提交 9fdf3c5，已 ff-only 合 `main`）落地道闸/防恐柱 6 个写端点。前端 `docs/api/security.openapi.json` 已补 6 个写端点与 `GateControlWriteRequest` / `BollardWriteRequest` schema，但**前端消费层尚未接入**：管理端道闸/防恐柱视图仍是只读列表，大屏面板也未订阅对应实时域。

契约是唯一真源（后端不得复制第二份 OpenAPI），本次把**契约真源、生成类型、管理端 CRUD 消费层、大屏实时订阅**一并补齐，并由 `check-api-contract.mjs --strict` 完成跨库守门。

## What Changes

- `docs/api/security.openapi.json`：新增 6 个写端点（operationId `createGate` / `updateGate` / `deleteGate` / `createBollard` / `updateBollard` / `deleteBollard`），同 path 多 method 合并到同一 path key；新增 schema `GateControlWriteRequest` / `BollardWriteRequest`（`name` 必填，无 `status` 字段）。
- 重跑 `npm run gen:api-types`：`src/types/generated/security.ts` 产出 6 个 operation 与 2 个 schema。
- `src/services/security.ts`：新增 `createGateControl` / `updateGateControl` / `deleteGateControl` / `createBollard` / `updateBollard` / `deleteBollard`（三态语义：demo/offline/live 降级）。
- `apps/mgmt/views/security/GateView.vue` / `BollardView.vue`：由只读列表升级为全量 CRUD——`MgmtRecordEditDialog` 标准范式 + 操作列（编辑/删除二次确认，`v-permission` 门禁 `security:gate-write` / `security:bollard-write`）+ `useDomainAutoRefresh` 订阅 `security.gate-control` / `security.bollard`。列表返回全量字段，编辑直接以行数据回填，不额外取详情。
- 大屏：`src/screen/lib/composables/useScreenSecurityData.ts` 新增 `refreshGateControls` / `refreshBollards`（绕过 `loaded` 单例守卫、失败保留上次数据）；`GateControlListPanel.vue` / `BollardListPanel.vue` 接入 `useDomainAutoRefresh` 订阅对应域，实现任一端改台账大屏自动重拉。

## Capabilities

- `security`（安全防恐，前端契约层 + 消费层）：新增「道闸台账 / 防恐柱台账 CRUD」的机器可读契约、TS 类型与管理端/大屏消费层。

## Impact

- 影响：`docs/api/security.openapi.json`、`src/types/generated/security.ts`、`src/services/security.ts`、`apps/mgmt/views/security/GateView.vue`、`apps/mgmt/views/security/BollardView.vue`、`src/screen/lib/composables/useScreenSecurityData.ts`、`src/screen/components/panels/security/GateControlListPanel.vue`、`src/screen/components/panels/security/BollardListPanel.vue`。
- 风险：写请求体不含 `status`，由 `MgmtRecordEditDialog` 的 FIELDS 白名单保证（`status` 不在字段清单内，提交 payload 永不含该字段），守住零下行控制红线。
