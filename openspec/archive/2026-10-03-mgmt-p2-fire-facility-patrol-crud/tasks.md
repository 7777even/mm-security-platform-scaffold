# Tasks: 消防设施台账与防火巡查 CRUD（前端）

## 契约真源（Task 1）

- [x] `docs/api/fire-facility.openapi.json` 补 3 个写端点，同 path 多 method 合并到同一 path key
- [x] `docs/api/fire-monitoring.openapi.json` 补 3 个写端点，合并到 `/patrols` path key
- [x] 新增 `FireFacilityLedgerWriteRequest` / `FirePatrolWriteRequest` schema（字段中文 description + example + required，**无 `status`**）

## 生成类型（Task 2）

- [x] `npm run gen:api-types`：`src/types/generated/fire-facility.ts` / `fire-monitoring.ts` 含 3+3 个 operation 与 2 个 schema
- [x] `npm run type-check` 无新增错误

## 服务层（Task 3）

- [x] `src/services/fireFacility.ts` 新增 `createFireFacilityLedger` / `updateFireFacilityLedger` / `deleteFireFacilityLedger`（三态降级）
- [x] `src/services/fireMonitoring.ts` 新增本地 `FirePatrolWriteRequest` 接口与 `createFirePatrol` / `updateFirePatrol` / `deleteFirePatrol`（三态降级）

## 管理端消费层（Task 4）

- [x] `apps/mgmt/views/fire/PatrolView.vue` 由只读升级为全量 CRUD（MgmtRecordEditDialog + 操作列 + `v-permission` + `useDomainAutoRefresh('fire.patrol-record')`）
- [x] `PatrolView` 编辑以行数据直接回填（列表返回全量字段，不取详情）；`locations` 文本拆分 `string[]`
- [x] `FireFacilityLedgerView.vue` CRUD 已落地（同批次内完成，作为范本）

## 测试与守门（Task 5）

- [x] `FireFacilityPatrolView.spec.ts`：订阅域 + 退订 + 删除二次确认 + 新增/编辑保存 + locations 拆分 + 写请求体不含 status（7 例全绿）
- [x] `vue-tsc --noEmit` 无新增错误；`eslint` 0 error
- [x] `node scripts/check-api-contract.mjs --strict`：schema 漂移 0（路由差异为预存技术债）

## 大屏联动（Task 6，后续）

- [ ] 大屏对 `fire-facility.ledger` / `fire.patrol-record` 的实时订阅（screen 经 `FireFacilityMonitoringDialog` / `FirePatrolDialog` 按需弹窗消费，本轮 deferred，独立 follow-up）

## 收尾（Task 7）

- [x] 双仓推送 `feature/scaffold-rebuild` 并联调（本 Change 随后端 V99/V102 一并推送）
