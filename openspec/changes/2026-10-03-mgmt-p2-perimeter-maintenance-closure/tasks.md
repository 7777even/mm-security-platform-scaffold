# Tasks: 周界告警 CRUD 闭环 + 设施报警改接对源 + 维保子写端点（前端）

## 契约真源（Task 1）

- [x] `docs/api/security.openapi.json` 新增 `GET /security/perimeter-alarms`（`listPerimeterAlarms`）operation + 200 example 数组
- [x] `docs/api/fire-facility.openapi.json`：`FireFacilityMaintenanceRecord` 加 `id`/`ledgerId`；新增 `FireFacilityMaintenanceWriteRequest` schema
- [x] `docs/api/fire-facility.openapi.json`：新增 `POST /fire-facility/ledger/{ledgerId}/maintenance` 与 `DELETE /fire-facility/maintenance/{recordId}`，注明权限码与广播域

## 生成类型与服务层（Task 2）

- [x] `npm run gen:api-types`：`security.ts` 出 `listPerimeterAlarms`；`fire-facility.ts` 出 `createMaintenance`/`deleteMaintenance` 与两 schema
- [x] `src/services/security.ts` 新增 `fetchPerimeterAlarms` / `deletePerimeterAlarm`
- [x] `src/services/fireFacility.ts`：`FireFacilityMaintenanceRecord` 加 `id`/`ledgerId`；新增 `FireFacilityMaintenanceWriteRequest` 与 `createFireFacilityMaintenance` / `deleteFireFacilityMaintenance`

## 管理端 UI（Task 3）

- [x] 新增 `apps/mgmt/views/security/PerimeterAlarmView.vue`（列表 + 新增 + 处置写回 + 删除 + 订阅 `security.perimeter-alarm`）
- [x] `apps/mgmt/router.ts` 新增 `/perimeter-alarm-mgmt`；`src/data/mgmtMenus.ts` 新增「周界入侵告警管理」叶子
- [x] `FireFacilityAlarmView.vue` 改读 `fetchFireFacilityAlarms`（`/fire-facility/alarms`）+ 订阅 `fire-facility.fault`
- [x] `FireFacilityMaintenanceView.vue` 展开维保记录支持新增/删除 + 订阅 `fire-facility.ledger`

## 守门（Task 4）

- [x] `npm run type-check` 无新增错误（另修 `FireFacilityLedgerView.vue` 两处 `DefaultRow` 强转既有 strictness 误报）
- [x] `npx eslint` 改动文件无违规
- [x] `npx vitest run src/services/fireFacility.spec.ts` 12 passed（含维保子写用例）
- [x] `node backend-scaffold/scripts/check-api-contract.mjs --strict`：schema 漂移 0；新增路由全部已对齐

## 收尾（Task 5）

- [x] 双仓（前端 `feature/scaffold-rebuild` / 后端 `main`）各自按 scope 提交并推送
