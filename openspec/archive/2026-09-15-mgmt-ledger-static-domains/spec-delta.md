# 契约变更说明

新增前端契约（机器可读真源，与后端 DTO 类名一一对应）：

## 新增 schema

- `MgmtLedgerMetaDto` / `MgmtLedgerFilterDto` / `MgmtLedgerCellDto` / `MgmtLedgerListResult`

## 四铁律

- 按域分组：`mgmt-ledger` tag；接口有注释；字段有中文 description；有 example。

## 四同步

- openspec（本 Change）→ 契约 `mgmt-ledger.openapi.json` → 后端实现（`/mgmt-ledger/{domain}`）→ 前端 `gen:api-types` 生成 `mgmt-ledger.ts`（已全绿）。
