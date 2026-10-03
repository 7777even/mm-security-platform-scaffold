# Tasks: 通用台账 25 域行级写能力（前端契约 + 消费层）

## 后端实现（Task 1）

- [x] `MgmtLedgerService` 新增 createRow/updateRow/deleteRow（@Transactional，LedgerIdSupport 分配 id/sortNo）
- [x] `MgmtLedgerController` 新增 POST/PUT/DELETE /{domain}/rows[/rowId]，@RequireAuth(role=ADMIN)
- [x] `list()` 返回与显示行对齐的 rowIds
- [x] 新增 DTO MgmtLedgerRowWriteRequest / MgmtLedgerCellWriteDto

## 契约真源（Task 2）

- [x] `docs/api/mgmt-ledger.openapi.json` 补 3 写端点 + 2 schema + list 结果 rowIds
- [x] description 注明 ADMIN 角色与事务语义

## 生成类型与守门（Task 3）

- [x] `npm run gen:api-types`：mgmt-ledger.ts 同步
- [x] `node backend-scaffold/scripts/check-api-contract.mjs --strict`：mgmt-ledger 路由差异 0 / schema 漂移 0
- [x] `node scripts/validate-api-contracts.mjs`：mgmt-ledger.openapi.json 无四铁律违规

## 前端消费层（Task 4）

- [x] `src/services/mgmtLedger.ts` 新增 3 个写函数
- [x] `MgmtLedgerView.vue` 加新增按钮 + 编辑/删除操作列 + 复用 MgmtRecordEditDialog（列定义动态驱动）

## 验证（Task 5）

- [x] `SUBAPP_NO_EMPTY=1 npm run build:subapps` 编译通过
- [ ] 双仓提交并按 scope 拆分推送（后端 common / 前端 mgmt），关联本 Change 归档
