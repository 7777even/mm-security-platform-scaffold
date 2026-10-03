# Proposal: 通用台账 25 域行级写能力（新增/编辑/删除）契约四同步

## Why

后台管理端 25 个通用台账域（alarm-config / drill-mgmt / ef-tank / enterprise-basic …）此前后端
`MgmtLedgerController` **仅 GET**，数据由 V51/V52/V53 迁移种子化进 `mgmt_ledger_*` 表。
菜单大量叶子标了 `action:'新增X'`，但 `MgmtLedgerView` 只能看不能改——写能力是「承诺未兑现」。
本次补齐行级写端点（新增/编辑/删除）+ 前端编辑/删除消费 + 列表返回 `rowIds` 供定位，
让 25 域从「只读台账」升级为「可维护台账」，并走跨库契约四同步守门。

## What Changes

### 后端（backend-scaffold）

- `MgmtLedgerService` 新增 `createRow` / `updateRow` / `deleteRow`（均 `@Transactional`）：
  行与单元格在同一事务内维护；主键与排序号由 `LedgerIdSupport.nextId` / `nextSortNo`
  显式分配（max+1），规避 Flyway 种子显式插 id 导致的自增序列滞后、新增撞主键（409「数据冲突」）。
- `MgmtLedgerController` 新增 3 个写端点：`POST /{domain}/rows`、`PUT /{domain}/rows/{rowId}`、
  `DELETE /{domain}/rows/{rowId}`，均 `@RequireAuth(role = "ADMIN")`（mgmt 控制台管理员维护，
  与 FormRecord / EmergencyPlan 同口径）。
- `list()` 返回 `rowIds`（与筛选/分页后的显示行严格对齐），前端据此定位编辑/删除目标行。
- 新增 DTO：`MgmtLedgerRowWriteRequest`（cells 数组）、`MgmtLedgerCellWriteDto`（colIndex/text/type）。

### 契约（前端真源）

- `docs/api/mgmt-ledger.openapi.json`：
  - 新增 `POST/PUT/DELETE /mgmt-ledger/{domain}/rows[/rowId]` 三个端点（同 path 多 method 合并到同一 path key）；
  - 新增 schema `MgmtLedgerRowWriteRequest` / `MgmtLedgerCellWriteDto`（字段中文 description + example）；
  - `MgmtLedgerListResult` 增加 `rowIds`（与 rows 一一对应）；
  - 各写端点 description 注明 `需 ADMIN 角色` 与事务语义。
- 重跑 `npm run gen:api-types`：`src/types/generated/mgmt-ledger.ts` 同步。

### 前端消费层

- `src/services/mgmtLedger.ts` 新增 `createMgmtLedgerRow` / `updateMgmtLedgerRow` / `deleteMgmtLedgerRow`。
- `apps/mgmt/views/MgmtLedgerView.vue`：页头加「新增」（文案取菜单叶子的「新增X」动作兜底「新增」）；
  表格加操作列（编辑/删除二次确认）；复用 `MgmtRecordEditDialog`，字段由后端列定义动态驱动
  （`prop = 列序号`，提交时还原为 `cells` 数组）。

## Capabilities

- `mgmt-ledger`（后台管理端通用台账，前端契约层）：新增「行级新增/编辑/删除」机器可读契约与 TS 类型，
  25 域从只读升级为可维护。

## Impact

- 影响：`docs/api/mgmt-ledger.openapi.json`、`src/types/generated/mgmt-ledger.ts`、
  `src/services/mgmtLedger.ts`、`apps/mgmt/views/MgmtLedgerView.vue`、后端 `mgmtLedger*` 系列。
- 风险：写端点需 ADMIN 角色——若 mgmt 操作账号非 ADMIN 将无法写入；产品若需更细粒度，
  应引入 `mgmt:ledger:write` 之类 perm 码并在 RBAC 播种，而非简单放开。
- 零下行控制：台账维护不涉及任何设备下行（红线无关）。
- 未含实时订阅（更新后需手动刷新），实时化留待 P2。
