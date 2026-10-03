# Spec Delta: mgmt-ledger

## 新增端点（path key 合并多 method）

- `POST /mgmt-ledger/{domain}/rows` — 新增台账行（ADMIN）
- `PUT /mgmt-ledger/{domain}/rows/{rowId}` — 更新台账行（ADMIN）
- `DELETE /mgmt-ledger/{domain}/rows/{rowId}` — 删除台账行（ADMIN）

## 变更端点

- `GET /mgmt-ledger/{domain}` — 响应 `MgmtLedgerListResult` 新增 `rowIds: integer[]`
  （与 `rows` 一一对应，用于前端编辑/删除定位）。

## 新增 schema

- `MgmtLedgerRowWriteRequest`：`{ cells: MgmtLedgerCellWriteDto[] }`
- `MgmtLedgerCellWriteDto`：`{ colIndex: integer; text: string|null; type: string|null }`
  （type 取值 ok/warn/bad/null，缺省普通文本）

## 不变

- `GET /mgmt-ledger/{domain}/meta` 及其 `MgmtLedgerMetaDto` 不变。
- 读端点零下行控制、仅登录态的语义不变。
