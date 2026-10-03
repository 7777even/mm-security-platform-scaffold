# Tasks: 道闸与防恐柱台账 CRUD 契约四同步与前端消费层（前端）

## 契约真源（Task 1）

- [x] `docs/api/security.openapi.json` 补 6 个写端点，同 path 多 method 合并到同一 path key
- [x] 新增 `GateControlWriteRequest` / `BollardWriteRequest` schema（`name` 必填，无 `status` 字段）
- [x] description 注明权限码、`@RealtimeSync` 广播域与必填项

## 生成类型（Task 2）

- [x] `npm run gen:api-types`：`src/types/generated/security.ts` 含 6 个 operation 与 2 个 schema
- [x] `npm run type-check` 无新增错误（存量 2 处错误属他人在途改动，非本次引入）

## 服务层（Task 3）

- [x] `src/services/security.ts` 新增 6 个写函数（三态降级语义）

## 管理端消费层（Task 4）

- [x] `GateView.vue` / `BollardView.vue` 升级为全量 CRUD（MgmtRecordEditDialog + 操作列 + `v-permission` + `useDomainAutoRefresh`）
- [x] 编辑以行数据直接回填（列表返回全量字段，不取详情）

## 大屏联动（Task 5）

- [x] `useScreenSecurityData.ts` 新增 `refreshGateControls` / `refreshBollards`
- [x] `GateControlListPanel.vue` / `BollardListPanel.vue` 订阅 `security.gate-control` / `security.bollard`

## 测试与守门（Task 6）

- [x] `SecuritySearchCrudViews.spec.ts` 扩 14 例（订阅域 + 删除二次确认 + 新增/编辑保存 + 写请求体不含 status）
- [x] `vue-tsc --noEmit` 无新增错误；`eslint` 0 error
- [x] `node backend-scaffold/scripts/check-api-contract.mjs --strict`：路由差异 0 / schema 漂移 0

## 收尾（Task 7）

- [ ] 双仓推送 `feature/scaffold-rebuild` 并联调（待本 Change 上列项全部完成后归档）
