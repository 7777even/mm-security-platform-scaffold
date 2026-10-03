# Tasks: 安防检索与周界告警 CRUD 契约四同步（前端）

## 契约真源（Task 1）

- [x] `docs/api/security.openapi.json` 补 7 个写端点，同 path 多 method 合并到同一 path key
- [x] 新增 `PersonSearchWriteRequest` / `VehicleSearchWriteRequest` schema（字段中文 description + example + required）
- [x] description 注明权限码、`@RealtimeSync` 广播域与必填项

## 生成类型（Task 2）

- [x] `npm run gen:api-types`：`src/types/generated/security.ts` 含 7 个 operation 与 2 个 schema
- [x] `npm run type-check` 无新增错误（存量 2 处错误属他人在途改动，非本次引入）

## 存量漂移修复（Task 3）

- [x] `docs/api/emergency.openapi.json`：`PUT/DELETE` 迁到 `/emergency/{cases,knowledge,phones}/{id}`
- [x] 重跑 `gen:api-types`，`emergency.ts` 同步更新

## 守门（Task 4）

- [x] `node backend-scaffold/scripts/check-api-contract.mjs --strict`：路由差异 0 / schema 漂移 0
- [x] `node scripts/validate-api-contracts.mjs`：security.openapi.json 无四铁律违规

## 前端消费层（Task 5）

- [x] `src/services/security.ts` 新增 `createPersonSearch` / `updatePersonSearch` / `deletePersonSearch` 与车辆同构三方法
- [x] 新增 `apps/mgmt/components/PersonSearchEditDialog.vue` / `VehicleSearchEditDialog.vue`（编辑前回显详情，`name` / `plate` 必填校验）
- [x] 人员/车辆登记视图加操作列（编辑 / 删除二次确认）并订阅 `security.person-search` / `security.vehicle-search`
- [x] 周界告警列表加删除入口（权限 `security:perimeter-delete`），订阅 `security.perimeter-alarm`

## 收尾（Task 6）

- [x] 双仓推送 `feature/scaffold-rebuild` 并联调（消费层已在 995dc5c/90f286c 落地，双仓已于 2026-10-03 推送，本 Change 闭环）
