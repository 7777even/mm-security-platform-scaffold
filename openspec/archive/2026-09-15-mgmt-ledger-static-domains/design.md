# 设计

## 渲染机制

- `MgmtLedgerView.vue` 取 `route.path` 去前导 `/` 得 `domain`，`onMounted` 拉 `/meta` 与列表；`watch(domain)` 支持跨域切换重拉。
- 列由 `meta.columns` 动态生成 `el-table-column`；单元格 `row.cells[i]?.type` 复用全局 `.mgmt-cell-badge--*` 类着色（ok/warn/bad）。
- 筛选行：`MgmtFilterBar` 按 `meta.filters` 渲染 `el-select`，选项含「全部」忽略；关键字 `keyword` 搜索；分页 `MgmtProTable`。

## 三件套复用

- `MgmtPageHead` + `MgmtFilterBar` + `MgmtProTable`，与既有 system/fire 域视图一致。

## 契约真源

- `docs/api/mgmt-ledger.openapi.json` 唯一真源；`npm run gen:api-types` 生成 `src/types/generated/mgmt-ledger.ts`（Dto 后缀保留）。
