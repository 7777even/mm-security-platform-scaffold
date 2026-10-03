# Design: 通用台账 25 域行级写能力

## 统一台账模型

三张表构成一套通用台账能力，按 `domain`（菜单叶子 path 去前导 `/`）分域：

- `mgmt_ledger_meta`：列定义（columns_json）+ 筛选（filter_json）+ 标题，每域一行。
- `mgmt_ledger_row`：行（domain + row_no + sort_no）。
- `mgmt_ledger_cell`：单元格（row_id + col_index + col_key + cell_text + cell_type）。

写操作只动 `row` + `cell`，不动 `meta`（列结构由种子迁移定义，前端列定义来自 meta，不随写变）。

## 写端点事务边界

- 新增：分配 `row.id` / `row.row_no` / `row.sort_no`（均 `LedgerIdSupport` max+1）→ `rowMapper.insert`
  → 按 `cells` 批量 `cellMapper.insert`（每个 cell 也走 `LedgerIdSupport.nextId` 分配主键）。
- 更新：按 `rowId` 定位（须 `domain` 匹配，否则 NOT_FOUND）→ 删除该行旧 cell → 重写 cell。
  行本身不动（保持排序稳定）。
- 删除：按 `rowId` 定位校验 → 删 cell → 删 row。

## rowIds 对齐

旧 `list()` 的 `rowIds` 来自全量行，与「筛选/分页后显示的 rows」不对齐，前端无法定位。
改为构造 `RowView{id, cells}`，筛选/分页后在**同一分页切片**上同时抽取 `rows` 与 `rowIds`，
保证 `rowIds[i]` 恒对应 `rows[i]`。

## 前端动态表单

25 域列定义各异，不可能为每个域写固定 `FieldDef`。改为从后端 `meta.columns` 动态生成
`FieldDef[]`（`prop = String(colIndex)`，`label = 列标题`，统一 `input`），复用
`MgmtRecordEditDialog` 的 schema 驱动渲染；提交时把 `{colIndex: text}` 还原为
`cells: MgmtLedgerCellWrite[]`。编辑时由 `rowIds[index]` 取目标行 id，由 `rows[index]` 回显文本。

## 鉴权

写端点 `@RequireAuth(role = "ADMIN")`，与既有 mgmt 写端点（FormRecord.update/delete、
EmergencyPlan.*）同口径；读端点维持仅登录态（后台管理端内部使用）。
