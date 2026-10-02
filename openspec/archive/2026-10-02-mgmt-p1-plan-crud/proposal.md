# Change: 应急预案管理页接入 CRUD 与实时订阅（P1）

## 为什么

Management 端 `EmergencyPlanView` 此前只读（`/catalog` + `/catalog-detail` 层次化摘要）。
后端补齐主记录写端点（见后端 Change `2026-10-02-mgmt-p1-plan-crud`）后，本页切换为应急预案主记录 CRUD
（`/emergency-plans` 根路径），并订阅 `emergency.plan` 广播域。

## 变更内容

- `src/services/emergencyPlan.ts`：新增 `fetchEmergencyPlanMetaList` / `createEmergencyPlanMeta(body)` /
  `updateEmergencyPlanMeta(id, body)` / `deleteEmergencyPlanMeta(id)` + 类型。
- `docs/api/emergency-plan.openapi.json`：`/emergency-plans` 补 `get` / `post`、`/emergency-plans/{id}` 补 `put` / `delete`
  - `EmergencyPlanMetaItem` / `EmergencyPlanMetaWriteRequest` schema；`npm run gen:api-types` 重新生成 TS 类型。
- `apps/mgmt/views/emergency/EmergencyPlanView.vue`：重写为 CRUD 表 + 弹窗
  - `v-permission="'emergency:plan:write'"` 门禁 + `useDomainAutoRefresh('emergency.plan', load)`。

## 设计要点

- **主记录（id 数值）区别于大屏 `/options` / `matrix` 只读视图**：`EmergencyPlanMetaItem` 行可直接灌表单。
- **tabKey / domain 用 select（既定枚举）**；**nuclear / isActive 用 select（是/否 → boolean）**；accidentType/facility 文本。
- **权限门禁 + 实时订阅**同上。

## 范围与非目标

- 非目标：不改 `/options` / `matrix` 大屏只读视图；不动 `invokePlan` 一键调用入口（仍 `@RequireAuth(role=ADMIN)`）。
- 零下行红线不变。
