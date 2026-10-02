# Change: 预案目录管理页接入 CRUD 与实时订阅（P1）

## 为什么

Management 端 `PlanCatalogView` 此前只读（仅 `GET /emergency-plans/catalog` 层次化摘要）。
后端补齐扁平台账写端点（见后端 Change `2026-10-02-mgmt-p1-plan-catalog-crud`）后，本页切换为可编辑扁平行
`/emergency-plans/catalog-items` 的 CRUD，并订阅 `emergency.plan-catalog` 广播域。

## 变更内容

- `src/services/emergencyPlan.ts`：新增 `fetchEmergencyPlanCatalogRows` / `createPlanCatalogRow(body)` /
  `updatePlanCatalogRow(id, body)` / `deletePlanCatalogRow(id)` + 类型。
- `docs/api/emergency-plan.openapi.json`：`/emergency-plans/catalog-items` 补 `get` / `post` / `put` / `delete`
  - `EmergencyPlanCatalogRow` / `EmergencyPlanCatalogWriteRequest` schema；`npm run gen:api-types` 重新生成 TS 类型。
- `apps/mgmt/views/emergency/PlanCatalogView.vue`：重写为 CRUD 表 + 弹窗
  - `v-permission="'emergency:plan-catalog:write'"` 门禁 + `useDomainAutoRefresh('emergency.plan-catalog', load)`。

## 设计要点

- **扁平行（id 数值）区别于 `/catalog` 层次化只读 DTO**：`EmergencyPlanCatalogRow` 的 id 是数值主键，行可直接灌表单。
- **canSwitch / isCurrent 用 select(0/1)**：枚举取值固定，按 mgmt 友好化标准用下拉。
- **权限门禁 + 实时订阅**同上。

## 范围与非目标

- 非目标：不改 `/catalog` 大屏只读语义（订阅 `emergency.plan-catalog` 域为后续可选跟随）。
- 零下行红线不变。
